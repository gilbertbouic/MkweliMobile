/**
 * @format
 */

import {
  extractEuNames,
  extractUkNames,
  extractUnNames,
  extractUsaNames,
  extractEuCsvNames,
  extractUkCsvNames,
  extractUsaCsvNames,
  createCsvStreamState,
  extractCsvNamesFromChunk,
  flushCsvStreamState,
} from '../src/sanctions/extractors';

describe('Sanctions XML extractors', () => {
  test('extractUnNames joins individual name parts and aliases', () => {
    const xml = `
      <CONSOLIDATED_LIST>
        <INDIVIDUALS>
          <INDIVIDUAL>
            <FIRST_NAME>John</FIRST_NAME>
            <SECOND_NAME>Q</SECOND_NAME>
            <THIRD_NAME>Public</THIRD_NAME>
            <INDIVIDUAL_ALIAS>
              <ALIAS_NAME>Johnny Public</ALIAS_NAME>
            </INDIVIDUAL_ALIAS>
          </INDIVIDUAL>
        </INDIVIDUALS>
        <ENTITIES>
          <ENTITY>
            <FIRST_NAME>Evil Corp Ltd</FIRST_NAME>
            <ENTITY_ALIAS>
              <ALIAS_NAME>Evil Co</ALIAS_NAME>
            </ENTITY_ALIAS>
          </ENTITY>
        </ENTITIES>
      </CONSOLIDATED_LIST>
    `;
    const names = extractUnNames(xml);
    expect(names).toEqual(
      expect.arrayContaining([
        'John Q Public',
        'Johnny Public',
        'Evil Corp Ltd',
        'Evil Co',
      ]),
    );
  });

  test('extractEuNames reads wholeName attributes', () => {
    const xml = `
      <export>
        <nameAlias wholeName="Saddam Hussein Al-Tikriti" firstName="Saddam" />
        <nameAlias wholeName="Abu Ali" />
      </export>
    `;
    const names = extractEuNames(xml);
    expect(names).toEqual(
      expect.arrayContaining(['Saddam Hussein Al-Tikriti', 'Abu Ali']),
    );
  });

  test('extractUkNames joins Name1-Name6 within a Name block', () => {
    const xml = `
      <Designations>
        <Names>
          <Name>
            <Name1>Vladimir</Name1>
            <Name2>Vladimirovich</Name2>
            <Name6>PUTIN</Name6>
            <NameType>Primary Name</NameType>
          </Name>
          <Name>
            <Name6>Vladimir Putin</Name6>
            <NameType>Alias</NameType>
          </Name>
        </Names>
        <NameNonLatinScript>Владимир Путин</NameNonLatinScript>
      </Designations>
    `;
    const names = extractUkNames(xml);
    expect(names).toEqual(
      expect.arrayContaining([
        'Vladimir Vladimirovich PUTIN',
        'Vladimir Putin',
        'Владимир Путин',
      ]),
    );
  });

  test('extractUsaNames handles SDN_ENHANCED formattedFullName and order variants', () => {
    const xml = `
      <sanctionsData>
        <entity>
          <names>
            <name>
              <translations>
                <translation>
                  <formattedFullName>PUTIN, Vladimir Vladimirovich</formattedFullName>
                </translation>
              </translations>
            </name>
          </names>
        </entity>
      </sanctionsData>
    `;
    const names = extractUsaNames(xml);
    expect(names).toContain('PUTIN, Vladimir Vladimirovich');
    expect(names).toContain('Vladimir Vladimirovich PUTIN');
  });

  test('extractUsaNames handles classic sdnEntry format', () => {
    const xml = `
      <sdnList>
        <sdnEntry>
          <lastName>AEROCARIBBEAN AIRLINES</lastName>
          <sdnType>Entity</sdnType>
          <akaList>
            <aka>
              <lastName>AERO-CARIBBEAN</lastName>
            </aka>
          </akaList>
        </sdnEntry>
        <sdnEntry>
          <lastName>DOE</lastName>
          <firstName>John</firstName>
          <sdnType>Individual</sdnType>
        </sdnEntry>
      </sdnList>
    `;
    const names = extractUsaNames(xml);
    expect(names).toEqual(
      expect.arrayContaining([
        'AEROCARIBBEAN AIRLINES',
        'AERO-CARIBBEAN',
        'John DOE',
      ]),
    );
  });

  test('skips empty and na name parts', () => {
    const xml = `
      <INDIVIDUAL>
        <FIRST_NAME>Only</FIRST_NAME>
        <SECOND_NAME>na</SECOND_NAME>
        <THIRD_NAME>  </THIRD_NAME>
        <ALIAS_NAME>na</ALIAS_NAME>
      </INDIVIDUAL>
    `;
    const names = extractUnNames(xml);
    expect(names).toEqual(['Only']);
  });
});

describe('Sanctions CSV extractors', () => {
  test('extractEuCsvNames parses simple EU CSV', () => {
    const csv = `name,type,designation_date
Saddam Hussein Al-Tikriti,individual,2001-01-01
Abu Ali,individual,2001-02-01`;
    const names = extractEuCsvNames(csv);
    expect(names).toEqual(
      expect.arrayContaining(['Saddam Hussein Al-Tikriti', 'Abu Ali']),
    );
  });

  test('extractEuCsvNames parses live FSD semicolon CSV with Naal_wholename', () => {
    const csv =
      '\ufeffDate_file;Entity_logical_id;Naal_wholename;Programme\n' +
      '05/06/2026;13;Saddam Hussein Al-Tikriti;IRQ\n' +
      '05/06/2026;13;Abu Ali;IRQ\n';
    const names = extractEuCsvNames(csv);
    expect(names).toEqual(
      expect.arrayContaining(['Saddam Hussein Al-Tikriti', 'Abu Ali']),
    );
  });

  test('extractEuCsvNames handles quoted fields', () => {
    const csv = `name,type,designation_date
"Hussein, Saddam",individual,2001-01-01
"Corp, Evil Ltd.",entity,2001-02-01`;
    const names = extractEuCsvNames(csv);
    expect(names).toEqual(
      expect.arrayContaining(['Hussein, Saddam', 'Corp, Evil Ltd.']),
    );
  });

  test('extractUkCsvNames parses simple UK CSV', () => {
    const csv = `name,type,designation_date
Vladimir Vladimirovich PUTIN,individual,2022-02-01
Rosneft PAO,entity,2022-02-15`;
    const names = extractUkCsvNames(csv);
    expect(names).toEqual(
      expect.arrayContaining(['Vladimir Vladimirovich PUTIN', 'Rosneft PAO']),
    );
  });

  test('extractUkCsvNames joins Name 1-6 and skips Report Date preamble', () => {
    const csv = `Report Date: 15-Jul-2026
Last Updated,Unique ID,Name 6,Name 1,Name 2,Name 3,Name 4,Name 5,Name type
16/04/2026,AFG0001,HAJI KHAIRULLAH HAJI SATTAR MONEY EXCHANGE,,,,,,Primary Name
01/01/2022,RUS0001,PUTIN,Vladimir,Vladimirovich,,,,Primary Name`;
    const names = extractUkCsvNames(csv);
    expect(names).toEqual(
      expect.arrayContaining([
        'HAJI KHAIRULLAH HAJI SATTAR MONEY EXCHANGE',
        'Vladimir Vladimirovich PUTIN',
      ]),
    );
  });

  test('extractUsaCsvNames parses headered OFAC-style CSV', () => {
    const csv = `name,type,entity_number,designations
"PUTIN, Vladimir Vladimirovich",individual,12345,"CEO Russia"
ROSNEFT PAO,entity,67890,"Russian Energy"`;
    const names = extractUsaCsvNames(csv);
    expect(names).toEqual(
      expect.arrayContaining([
        'PUTIN, Vladimir Vladimirovich',
        'Vladimir Vladimirovich PUTIN',
        'ROSNEFT PAO',
      ]),
    );
  });

  test('extractUsaCsvNames parses live SDN.CSV with no header row', () => {
    const csv = `36,"AEROCARIBBEAN AIRLINES",-0- ,"CUBA",-0-
173,"ANGLO-CARIBBEAN CO., LTD.",-0- ,"CUBA",-0-
306,"BANCO NACIONAL DE CUBA",-0- ,"CUBA",-0-`;
    const names = extractUsaCsvNames(csv);
    expect(names).toEqual(
      expect.arrayContaining([
        'AEROCARIBBEAN AIRLINES',
        'ANGLO-CARIBBEAN CO., LTD.',
        'BANCO NACIONAL DE CUBA',
      ]),
    );
  });

  test('extractUsaCsvNames parses OpenSanctions names.txt (one name per line)', () => {
    const csv = `AEROCARIBBEAN AIRLINES
BANCO NACIONAL DE CUBA
PUTIN, Vladimir Vladimirovich`;
    const names = extractUsaCsvNames(csv);
    expect(names).toEqual(
      expect.arrayContaining([
        'AEROCARIBBEAN AIRLINES',
        'BANCO NACIONAL DE CUBA',
        'PUTIN, Vladimir Vladimirovich',
        'Vladimir Vladimirovich PUTIN',
      ]),
    );
  });

  test('extractUsaCsvNames parses OpenSanctions simple CSV with aliases', () => {
    const csv = `"id","schema","name","aliases","dataset"
"1","Person","Michael Kuajien","Michael Kuajian;Michael Kuajien Duer Mayok","US OFAC SDN"
"2","Organization","AEROCARIBBEAN AIRLINES","","US OFAC SDN"`;
    const names = extractUsaCsvNames(csv);
    expect(names).toEqual(
      expect.arrayContaining([
        'Michael Kuajien',
        'Michael Kuajian',
        'Michael Kuajien Duer Mayok',
        'AEROCARIBBEAN AIRLINES',
      ]),
    );
  });

  test('extractUsaCsvNames handles BOM-prefixed headers', () => {
    const csv = `\ufeffname,type,entity_number
"PUTIN, Vladimir Vladimirovich",individual,12345`;
    const names = extractUsaCsvNames(csv);
    expect(names).toEqual(
      expect.arrayContaining([
        'PUTIN, Vladimir Vladimirovich',
        'Vladimir Vladimirovich PUTIN',
      ]),
    );
  });

  test('chunked CSV streaming preserves names across chunk boundaries', () => {
    const state = createCsvStreamState();
    const part1 = '\ufeffname,type\n"PUTIN, Vladimir';
    const part2 = ' Vladimirovich",individual\nROSNEFT PAO,entity';

    const first = extractCsvNamesFromChunk('usa', part1, state);
    const second = extractCsvNamesFromChunk('usa', part2, first.state);
    const flushed = flushCsvStreamState('usa', second.state);

    const names = [...first.names, ...second.names, ...flushed];
    expect(names).toEqual(
      expect.arrayContaining([
        'PUTIN, Vladimir Vladimirovich',
        'Vladimir Vladimirovich PUTIN',
        'ROSNEFT PAO',
      ]),
    );
  });

  test('CSV extractors handle empty lines', () => {
    const csv = `name,type
John Smith,individual

Jane Doe,individual`;
    const names = extractUsaCsvNames(csv);
    expect(names).toEqual(
      expect.arrayContaining(['John Smith', 'Jane Doe']),
    );
  });

  test('CSV extractors skip whitespace-only names', () => {
    const csv = `name,type
John Smith,individual
   ,individual
Jane Doe,individual`;
    const names = extractUsaCsvNames(csv);
    expect(names).toEqual(
      expect.arrayContaining(['John Smith', 'Jane Doe']),
    );
    expect(names.length).toBe(2);
  });
});

