/**
 * @format
 */

import {
  extractEuNames,
  extractUkNames,
  extractUnNames,
  extractUsaNames,
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
