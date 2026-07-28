/**
 * UI strings for English, French, Portuguese, and Spanish.
 */

export type LanguageCode = 'en' | 'fr' | 'pt' | 'es';

export const LANGUAGES: {
  code: LanguageCode;
  shortLabel: string;
  nativeName: string;
  locale: string;
}[] = [
  {code: 'en', shortLabel: 'EN', nativeName: 'English', locale: 'en-US'},
  {code: 'fr', shortLabel: 'FR', nativeName: 'Français', locale: 'fr-FR'},
  {code: 'pt', shortLabel: 'PT', nativeName: 'Português', locale: 'pt-PT'},
  {code: 'es', shortLabel: 'ES', nativeName: 'Español', locale: 'es-ES'},
];

export type TranslationKey = keyof typeof en;

const en = {
  appTitle: 'AML Sanctions Screening',
  howToUse: 'How to use',
  howToUseA11y: 'How to use this app',
  language: 'Language',
  loadingData: 'Loading sanctions data…',
  sanctionsLists: 'Sanctions lists',
  lastUpdate: 'Last update: {{date}}',
  namesLoaded: 'Names loaded: ~{{count}} (UN / EU / UK / USA)',
  bundledSeed: 'Bundled seed data (not yet updated)',
  seedSuffix: ' (seed)',
  staleNotice:
    'Lists are older than 30 days (or still bundled). The app will download the latest official lists automatically when online.',
  autoUpdating:
    'Lists are outdated. Downloading and parsing the latest official lists automatically…',
  autoUpdateOk:
    'Automatic update complete: {{ok}}/{{total}} sources · {{names}} total names.',
  autoUpdatePartial:
    'Automatic update partial: {{ok}}/{{total}} sources · {{names}} names. Kept previous lists for: {{failed}}',
  autoUpdateFailed: 'Automatic update failed: {{error}}. You can retry with Update lists.',
  updateLists: 'Update lists',
  placeholderName: 'Enter name to screen',
  screen: 'Screen',
  resultSanctioned: 'Sanctioned: Match found in database.',
  resultStrong:
    'Strong match: {{count}} high-confidence name(s) on the lists.',
  resultPossible:
    'Possible match: {{count}} name(s) to review (not a confirmed hit).',
  resultClear: 'No list match above threshold for this query.',
  resultShortQuery:
    'Enter a longer name or at least one name part with 3+ letters.',
  resultEmptyQuery: 'Enter a name to screen.',
  tokensUsed: 'Name parts used: {{tokens}}',
  badgeStrong: 'Strong',
  badgePossible: 'Possible',
  matchScore: '{{score}}%',
  resultReviewHint:
    'Review each hit against your records. Token matching finds name parts in any order; it is not identity verification. A clear result only means no score above the threshold.',
  emptyHint:
    'Enter a person or organisation name (full or partial) and tap Screen. Surname-only and any name order are supported.',
  updateOk:
    'Updated {{ok}}/{{total}} sources · {{names}} total names. Old lists replaced; temporary XML discarded.',
  updatePartial:
    'Updated {{ok}}/{{total}} sources · {{names}} total names. Kept previous lists for: {{failed}}',
  updateFailed: 'Update failed: {{error}}',
  progressStarting: 'Starting sanctions list update…',
  progressDownloading: 'Downloading {{label}} list…',
  progressDownloadingPct: 'Downloading {{label}}… {{pct}}%',
  progressExtracting: 'Extracting names from {{label}}…',
  progressSaving: 'Saving {{count}} {{label}} names…',
  progressCleaning: 'Deleting temporary {{label}} XML…',
  progressDoneAll:
    'All sanctions lists updated. Old lists replaced; temp XML deleted.',
  progressDonePartial:
    'Updated {{ok}}/{{total}} sources. Failed sources kept previous lists.',
  progressErrorAll: 'Update failed for all sources. Previous lists kept.',

  // Instructions
  instructionsTitle: 'How to use Mkweli',
  back: '← Back',
  backToScreening: 'Back to screening',
  backA11y: 'Back to screening',
  returnA11y: 'Return to main screen',
  instructionsIntro:
    'Follow these steps to screen names and keep your sanctions lists up to date.',
  sectionWhatTitle: 'What this app does',
  sectionWhatBody:
    'Mkweli screens a person or organisation name against official sanctions lists from the United Nations (UN), European Union (EU), United Kingdom (UK), and United States (OFAC SDN). It is intended for basic AML name checks. Matching is token-based: name parts are compared in any order, and partial queries (for example surname only) can return ranked possible hits with a score.',
  sectionScreenTitle: 'Screen a name',
  sectionScreenBody:
    '1. On the main screen, type a person or organisation name (full or partial) in the search field.\n2. Tap Screen.\n3. Read the result:\n   • Red — strong match: high-confidence list name(s); review required.\n   • Orange — possible match: partial name-part agreement; review before acting.\n   • Green — no list match above the score threshold for this query.\n4. When hits appear, each row shows the list name and a score (0–100%).\n\nTips: Surname-only and reversed name order work. Very short single parts (under 3 letters) are ignored. Common single given names are scored more cautiously. Typos and alternate spellings are not yet fuzzy-matched—try known aliases if you expect a hit.',
  sectionUpdateTitle: 'Update sanctions lists',
  sectionUpdateBody:
    'Lists ship with the app as seed data. Every time you open the app, if lists are older than 30 days (or still seed data), Mkweli automatically downloads and parses the latest official lists when the device is online.\n\nYou can also refresh at any time:\n1. Ensure the device has internet access.\n2. On the main screen, open the Sanctions lists card.\n3. Tap Update lists.\n4. Wait while each source downloads (UN, EU, UK, USA). Progress shows for each step.\n5. When finished, only names are kept. Temporary download files are deleted. Previous lists for a source are replaced only if that source updates successfully.\n\nIf a source fails (network error, server issue), the app keeps the last good list for that source. You can try Update lists again later.\n\nAn orange notice appears if lists are older than 30 days or still using bundled seed data.',
  sectionStatusTitle: 'Understanding list status',
  sectionStatusBody:
    '• Last update — when any successful download last completed.\n• Names loaded — approximate total names across all sources.\n• Source chips (UN / EU / UK / USA) — count of names per list. “(seed)” means the built-in data is still in use for that source. A warning mark means the last update for that source failed.',
  sectionOfflineTitle: 'Offline use',
  sectionOfflineBody:
    'Screening works offline using the names already on the device (bundled seed or last successful download). Updating lists requires internet. The USA (OFAC) file is large and may take several minutes on a slow connection.',
  sectionLimitsTitle: 'Important limitations',
  sectionLimitsBody:
    '• Matching uses name tokens (parts) with scores; it is not fuzzy spelling match, biometric ID, or a full KYC/AML system.\n• A green / “no match above threshold” result does not prove a person is clear of all risk.\n• Possible matches require human review; shared surnames or common given names can appear for unrelated people.\n• Always follow your organisation’s compliance policy and, where required, use authorised screening systems and human review.\n• List content comes from public official sources; Mkweli does not alter those designations.',
} as const;

const fr: Record<TranslationKey, string> = {
  appTitle: 'Contrôle des sanctions LBA',
  howToUse: 'Mode d’emploi',
  howToUseA11y: 'Comment utiliser cette application',
  language: 'Langue',
  loadingData: 'Chargement des listes de sanctions…',
  sanctionsLists: 'Listes de sanctions',
  lastUpdate: 'Dernière mise à jour : {{date}}',
  namesLoaded: 'Noms chargés : ~{{count}} (ONU / UE / RU / USA)',
  bundledSeed: 'Données intégrées (pas encore mises à jour)',
  seedSuffix: ' (intégrée)',
  staleNotice:
    'Les listes ont plus de 30 jours (ou sont encore intégrées). L’application téléchargera automatiquement les listes officielles les plus récentes en ligne.',
  autoUpdating:
    'Listes obsolètes. Téléchargement et analyse automatiques des listes officielles…',
  autoUpdateOk:
    'Mise à jour automatique terminée : {{ok}}/{{total}} sources · {{names}} noms au total.',
  autoUpdatePartial:
    'Mise à jour automatique partielle : {{ok}}/{{total}} sources · {{names}} noms. Listes précédentes conservées pour : {{failed}}',
  autoUpdateFailed:
    'Échec de la mise à jour automatique : {{error}}. Réessayez avec Mettre à jour les listes.',
  updateLists: 'Mettre à jour les listes',
  placeholderName: 'Saisir un nom à contrôler',
  screen: 'Contrôler',
  resultSanctioned: 'Sanctionné : correspondance trouvée dans la base.',
  resultStrong:
    'Correspondance forte : {{count}} nom(s) à forte confiance sur les listes.',
  resultPossible:
    'Correspondance possible : {{count}} nom(s) à examiner (pas une confirmation).',
  resultClear:
    'Aucune correspondance au-dessus du seuil pour cette recherche.',
  resultShortQuery:
    'Saisissez un nom plus long ou au moins une partie de nom de 3 lettres ou plus.',
  resultEmptyQuery: 'Saisissez un nom à contrôler.',
  tokensUsed: 'Parties de nom utilisées : {{tokens}}',
  badgeStrong: 'Forte',
  badgePossible: 'Possible',
  matchScore: '{{score}} %',
  resultReviewHint:
    'Examinez chaque résultat par rapport à vos dossiers. La correspondance par jetons trouve des parties de nom dans n’importe quel ordre ; ce n’est pas une vérification d’identité. Un résultat vert signifie seulement qu’aucun score n’a dépassé le seuil.',
  emptyHint:
    'Saisissez un nom de personne ou d’organisation (complet ou partiel) puis Contrôler. Nom de famille seul et tout ordre des noms sont pris en charge.',
  updateOk:
    'Mis à jour {{ok}}/{{total}} sources · {{names}} noms au total. Anciennes listes remplacées ; XML temporaire supprimé.',
  updatePartial:
    'Mis à jour {{ok}}/{{total}} sources · {{names}} noms au total. Listes précédentes conservées pour : {{failed}}',
  updateFailed: 'Échec de la mise à jour : {{error}}',
  progressStarting: 'Démarrage de la mise à jour des listes…',
  progressDownloading: 'Téléchargement de la liste {{label}}…',
  progressDownloadingPct: 'Téléchargement de {{label}}… {{pct}} %',
  progressExtracting: 'Extraction des noms de {{label}}…',
  progressSaving: 'Enregistrement de {{count}} noms {{label}}…',
  progressCleaning: 'Suppression du XML temporaire {{label}}…',
  progressDoneAll:
    'Toutes les listes ont été mises à jour. Anciennes listes remplacées ; XML temporaire supprimé.',
  progressDonePartial:
    'Mis à jour {{ok}}/{{total}} sources. Les sources en échec conservent les listes précédentes.',
  progressErrorAll:
    'Échec pour toutes les sources. Listes précédentes conservées.',

  instructionsTitle: 'Mode d’emploi Mkweli',
  back: '← Retour',
  backToScreening: 'Retour au contrôle',
  backA11y: 'Retour au contrôle',
  returnA11y: 'Retour à l’écran principal',
  instructionsIntro:
    'Suivez ces étapes pour contrôler des noms et maintenir vos listes de sanctions à jour.',
  sectionWhatTitle: 'À quoi sert cette application',
  sectionWhatBody:
    'Mkweli compare le nom d’une personne ou d’une organisation aux listes officielles de sanctions des Nations Unies (ONU), de l’Union européenne (UE), du Royaume-Uni (RU) et des États-Unis (OFAC SDN). Elle est destinée à des contrôles LBA basiques. La correspondance est par jetons : les parties de nom sont comparées dans n’importe quel ordre, et les recherches partielles (par ex. nom de famille seul) peuvent renvoyer des résultats classés avec un score.',
  sectionScreenTitle: 'Contrôler un nom',
  sectionScreenBody:
    '1. Sur l’écran principal, saisissez un nom de personne ou d’organisation (complet ou partiel).\n2. Appuyez sur Contrôler.\n3. Lisez le résultat :\n   • Rouge — correspondance forte : nom(s) à forte confiance ; examen requis.\n   • Orange — correspondance possible : accord partiel des parties de nom ; examinez avant d’agir.\n   • Vert — aucune correspondance au-dessus du seuil pour cette requête.\n4. Chaque ligne affiche le nom sur la liste et un score (0–100 %).\n\nAstuces : nom de famille seul et ordre inversé fonctionnent. Les parties trop courtes (moins de 3 lettres) sont ignorées. Les prénoms très courants en requête unique sont notés plus prudemment. Les fautes de frappe ne sont pas encore gérées en flou — essayez les alias connus.',
  sectionUpdateTitle: 'Mettre à jour les listes de sanctions',
  sectionUpdateBody:
    'Des listes de base sont fournies avec l’application. À chaque ouverture, si les listes ont plus de 30 jours (ou sont encore intégrées), Mkweli télécharge et analyse automatiquement les listes officielles lorsque l’appareil est en ligne.\n\nVous pouvez aussi actualiser à tout moment :\n1. Vérifiez que l’appareil a accès à Internet.\n2. Sur l’écran principal, ouvrez la carte Listes de sanctions.\n3. Appuyez sur Mettre à jour les listes.\n4. Attendez le téléchargement de chaque source (ONU, UE, RU, USA). La progression s’affiche.\n5. À la fin, seuls les noms sont conservés. Les fichiers temporaires sont supprimés. Les listes précédentes d’une source ne sont remplacées que si la mise à jour de cette source réussit.\n\nSi une source échoue (réseau, serveur), l’application conserve la dernière bonne liste pour cette source. Réessayez plus tard.\n\nUn message orange s’affiche si les listes ont plus de 30 jours ou utilisent encore les données intégrées.',
  sectionStatusTitle: 'Comprendre l’état des listes',
  sectionStatusBody:
    '• Dernière mise à jour — date du dernier téléchargement réussi.\n• Noms chargés — total approximatif sur toutes les sources.\n• Pastilles de source (ONU / UE / RU / USA) — nombre de noms par liste. « (intégrée) » signifie que les données fournies sont encore utilisées. Un avertissement indique un échec de la dernière mise à jour pour cette source.',
  sectionOfflineTitle: 'Utilisation hors ligne',
  sectionOfflineBody:
    'Le contrôle fonctionne hors ligne avec les noms déjà présents sur l’appareil (données intégrées ou dernier téléchargement réussi). La mise à jour des listes nécessite Internet. Le fichier USA (OFAC) est volumineux et peut prendre plusieurs minutes sur une connexion lente.',
  sectionLimitsTitle: 'Limitations importantes',
  sectionLimitsBody:
    '• La correspondance utilise des jetons (parties de nom) avec scores ; ce n’est pas une recherche floue d’orthographe, une vérification biométrique ni un système KYC/LBA complet.\n• Un résultat vert / « aucun match au-dessus du seuil » ne prouve pas l’absence de tout risque.\n• Les correspondances possibles exigent une revue humaine ; des noms de famille partagés ou des prénoms courants peuvent concerner d’autres personnes.\n• Respectez toujours la politique de conformité de votre organisation et, le cas échéant, des systèmes de filtrage autorisés et une revue humaine.\n• Le contenu des listes provient de sources officielles publiques ; Mkweli ne modifie pas ces désignations.',
};

const pt: Record<TranslationKey, string> = {
  appTitle: 'Triagem de sanções ALD',
  howToUse: 'Como usar',
  howToUseA11y: 'Como usar esta aplicação',
  language: 'Idioma',
  loadingData: 'A carregar dados de sanções…',
  sanctionsLists: 'Listas de sanções',
  lastUpdate: 'Última atualização: {{date}}',
  namesLoaded: 'Nomes carregados: ~{{count}} (ONU / UE / RU / EUA)',
  bundledSeed: 'Dados incluídos (ainda não atualizados)',
  seedSuffix: ' (incluída)',
  staleNotice:
    'As listas têm mais de 30 dias (ou ainda são as incluídas). A aplicação descarregará automaticamente as listas oficiais mais recentes quando estiver online.',
  autoUpdating:
    'Listas desatualizadas. A descarregar e analisar automaticamente as listas oficiais…',
  autoUpdateOk:
    'Atualização automática concluída: {{ok}}/{{total}} fontes · {{names}} nomes no total.',
  autoUpdatePartial:
    'Atualização automática parcial: {{ok}}/{{total}} fontes · {{names}} nomes. Mantidas as listas anteriores para: {{failed}}',
  autoUpdateFailed:
    'Falha na atualização automática: {{error}}. Pode tentar novamente com Atualizar listas.',
  updateLists: 'Atualizar listas',
  placeholderName: 'Introduza o nome a verificar',
  screen: 'Verificar',
  resultSanctioned: 'Sancionado: correspondência encontrada na base de dados.',
  resultStrong:
    'Correspondência forte: {{count}} nome(s) de elevada confiança nas listas.',
  resultPossible:
    'Correspondência possível: {{count}} nome(s) a rever (não é confirmação).',
  resultClear:
    'Nenhuma correspondência acima do limiar para esta pesquisa.',
  resultShortQuery:
    'Introduza um nome mais longo ou pelo menos uma parte com 3 ou mais letras.',
  resultEmptyQuery: 'Introduza um nome a verificar.',
  tokensUsed: 'Partes do nome usadas: {{tokens}}',
  badgeStrong: 'Forte',
  badgePossible: 'Possível',
  matchScore: '{{score}}%',
  resultReviewHint:
    'Reveja cada resultado face aos seus registos. A correspondência por tokens encontra partes do nome em qualquer ordem; não é verificação de identidade. Um resultado limpo só significa que nenhum score ultrapassou o limiar.',
  emptyHint:
    'Introduza o nome de uma pessoa ou organização (completo ou parcial) e toque em Verificar. Apenas apelido e qualquer ordem de nomes são suportados.',
  updateOk:
    'Atualizadas {{ok}}/{{total}} fontes · {{names}} nomes no total. Listas antigas substituídas; XML temporário eliminado.',
  updatePartial:
    'Atualizadas {{ok}}/{{total}} fontes · {{names}} nomes no total. Mantidas as listas anteriores para: {{failed}}',
  updateFailed: 'Falha na atualização: {{error}}',
  progressStarting: 'A iniciar a atualização das listas de sanções…',
  progressDownloading: 'A descarregar a lista {{label}}…',
  progressDownloadingPct: 'A descarregar {{label}}… {{pct}}%',
  progressExtracting: 'A extrair nomes de {{label}}…',
  progressSaving: 'A guardar {{count}} nomes de {{label}}…',
  progressCleaning: 'A eliminar o XML temporário de {{label}}…',
  progressDoneAll:
    'Todas as listas de sanções foram atualizadas. Listas antigas substituídas; XML temporário eliminado.',
  progressDonePartial:
    'Atualizadas {{ok}}/{{total}} fontes. As fontes com falha mantêm as listas anteriores.',
  progressErrorAll:
    'Falha em todas as fontes. Listas anteriores mantidas.',

  instructionsTitle: 'Como usar o Mkweli',
  back: '← Voltar',
  backToScreening: 'Voltar à triagem',
  backA11y: 'Voltar à triagem',
  returnA11y: 'Voltar ao ecrã principal',
  instructionsIntro:
    'Siga estes passos para verificar nomes e manter as listas de sanções atualizadas.',
  sectionWhatTitle: 'O que esta aplicação faz',
  sectionWhatBody:
    'O Mkweli compara o nome de uma pessoa ou organização com listas oficiais de sanções das Nações Unidas (ONU), União Europeia (UE), Reino Unido (RU) e Estados Unidos (OFAC SDN). Destina-se a controlos ALD básicos. A correspondência é por tokens: as partes do nome são comparadas em qualquer ordem, e pesquisas parciais (por exemplo só apelido) podem devolver resultados ordenados com pontuação.',
  sectionScreenTitle: 'Verificar um nome',
  sectionScreenBody:
    '1. No ecrã principal, escreva o nome de uma pessoa ou organização (completo ou parcial).\n2. Toque em Verificar.\n3. Leia o resultado:\n   • Vermelho — correspondência forte: nome(s) de elevada confiança; revisão necessária.\n   • Laranja — correspondência possível: acordo parcial das partes do nome; reveja antes de agir.\n   • Verde — nenhuma correspondência acima do limiar para esta consulta.\n4. Cada linha mostra o nome na lista e uma pontuação (0–100%).\n\nDicas: só apelido e ordem invertida funcionam. Partes muito curtas (menos de 3 letras) são ignoradas. Nomes próprios muito comuns em pesquisa única são pontuados com mais cautela. Erros de digitação ainda não têm correspondência difusa — experimente alias conhecidos.',
  sectionUpdateTitle: 'Atualizar listas de sanções',
  sectionUpdateBody:
    'As listas são fornecidas com a aplicação como dados iniciais. Sempre que abrir a aplicação, se as listas tiverem mais de 30 dias (ou ainda forem dados incluídos), o Mkweli descarrega e analisa automaticamente as listas oficiais quando o dispositivo está online.\n\nTambém pode atualizar a qualquer momento:\n1. Certifique-se de que o dispositivo tem Internet.\n2. No ecrã principal, abra o cartão Listas de sanções.\n3. Toque em Atualizar listas.\n4. Aguarde o download de cada fonte (ONU, UE, RU, EUA). O progresso é mostrado.\n5. No fim, apenas os nomes são guardados. Os ficheiros temporários são eliminados. As listas anteriores de uma fonte só são substituídas se a atualização dessa fonte for bem-sucedida.\n\nSe uma fonte falhar (rede, servidor), a aplicação mantém a última lista válida dessa fonte. Pode tentar novamente mais tarde.\n\nUm aviso laranja aparece se as listas tiverem mais de 30 dias ou ainda usarem os dados incluídos.',
  sectionStatusTitle: 'Compreender o estado das listas',
  sectionStatusBody:
    '• Última atualização — quando o último download bem-sucedido foi concluído.\n• Nomes carregados — total aproximado em todas as fontes.\n• Etiquetas de fonte (ONU / UE / RU / EUA) — contagem de nomes por lista. “(incluída)” significa que os dados incorporados ainda estão em uso. Um aviso indica falha na última atualização dessa fonte.',
  sectionOfflineTitle: 'Utilização offline',
  sectionOfflineBody:
    'A triagem funciona offline com os nomes já no dispositivo (dados incluídos ou último download bem-sucedido). Atualizar listas exige Internet. O ficheiro dos EUA (OFAC) é grande e pode demorar vários minutos numa ligação lenta.',
  sectionLimitsTitle: 'Limitações importantes',
  sectionLimitsBody:
    '• A correspondência usa tokens (partes do nome) com pontuações; não é correspondência difusa de ortografia, identificação biométrica nem um sistema KYC/ALD completo.\n• Um resultado verde / “sem match acima do limiar” não prova ausência de todo o risco.\n• Correspondências possíveis exigem revisão humana; apelidos partilhados ou nomes próprios comuns podem referir-se a outras pessoas.\n• Siga sempre a política de conformidade da sua organização e, quando necessário, sistemas de triagem autorizados e revisão humana.\n• O conteúdo das listas provém de fontes oficiais públicas; o Mkweli não altera essas designações.',
};

const es: Record<TranslationKey, string> = {
  appTitle: 'Cribado de sanciones PLA',
  howToUse: 'Cómo usar',
  howToUseA11y: 'Cómo usar esta aplicación',
  language: 'Idioma',
  loadingData: 'Cargando datos de sanciones…',
  sanctionsLists: 'Listas de sanciones',
  lastUpdate: 'Última actualización: {{date}}',
  namesLoaded: 'Nombres cargados: ~{{count}} (ONU / UE / RU / EE. UU.)',
  bundledSeed: 'Datos incluidos (aún no actualizados)',
  seedSuffix: ' (incluida)',
  staleNotice:
    'Las listas tienen más de 30 días (o siguen siendo las incluidas). La aplicación descargará automáticamente las listas oficiales más recientes cuando esté en línea.',
  autoUpdating:
    'Listas desactualizadas. Descargando y analizando automáticamente las listas oficiales…',
  autoUpdateOk:
    'Actualización automática completada: {{ok}}/{{total}} fuentes · {{names}} nombres en total.',
  autoUpdatePartial:
    'Actualización automática parcial: {{ok}}/{{total}} fuentes · {{names}} nombres. Se conservaron listas anteriores para: {{failed}}',
  autoUpdateFailed:
    'Falló la actualización automática: {{error}}. Puede reintentar con Actualizar listas.',
  updateLists: 'Actualizar listas',
  placeholderName: 'Introduzca el nombre a verificar',
  screen: 'Verificar',
  resultSanctioned: 'Sancionado: coincidencia encontrada en la base de datos.',
  resultStrong:
    'Coincidencia fuerte: {{count}} nombre(s) de alta confianza en las listas.',
  resultPossible:
    'Posible coincidencia: {{count}} nombre(s) a revisar (no es una confirmación).',
  resultClear:
    'Ninguna coincidencia por encima del umbral para esta consulta.',
  resultShortQuery:
    'Introduzca un nombre más largo o al menos una parte con 3 o más letras.',
  resultEmptyQuery: 'Introduzca un nombre para verificar.',
  tokensUsed: 'Partes del nombre usadas: {{tokens}}',
  badgeStrong: 'Fuerte',
  badgePossible: 'Posible',
  matchScore: '{{score}}%',
  resultReviewHint:
    'Revise cada resultado frente a sus registros. La coincidencia por tokens encuentra partes del nombre en cualquier orden; no es verificación de identidad. Un resultado limpio solo significa que ninguna puntuación superó el umbral.',
  emptyHint:
    'Introduzca el nombre de una persona u organización (completo o parcial) y pulse Verificar. Se admiten solo apellido y cualquier orden de nombres.',
  updateOk:
    'Actualizadas {{ok}}/{{total}} fuentes · {{names}} nombres en total. Listas antiguas reemplazadas; XML temporal eliminado.',
  updatePartial:
    'Actualizadas {{ok}}/{{total}} fuentes · {{names}} nombres en total. Se conservaron listas anteriores para: {{failed}}',
  updateFailed: 'Error en la actualización: {{error}}',
  progressStarting: 'Iniciando la actualización de las listas de sanciones…',
  progressDownloading: 'Descargando la lista {{label}}…',
  progressDownloadingPct: 'Descargando {{label}}… {{pct}} %',
  progressExtracting: 'Extrayendo nombres de {{label}}…',
  progressSaving: 'Guardando {{count}} nombres de {{label}}…',
  progressCleaning: 'Eliminando el XML temporal de {{label}}…',
  progressDoneAll:
    'Todas las listas de sanciones se actualizaron. Listas antiguas reemplazadas; XML temporal eliminado.',
  progressDonePartial:
    'Actualizadas {{ok}}/{{total}} fuentes. Las fuentes con error conservan las listas anteriores.',
  progressErrorAll:
    'Error en todas las fuentes. Se conservan las listas anteriores.',

  instructionsTitle: 'Cómo usar Mkweli',
  back: '← Atrás',
  backToScreening: 'Volver al cribado',
  backA11y: 'Volver al cribado',
  returnA11y: 'Volver a la pantalla principal',
  instructionsIntro:
    'Siga estos pasos para verificar nombres y mantener actualizadas las listas de sanciones.',
  sectionWhatTitle: 'Qué hace esta aplicación',
  sectionWhatBody:
    'Mkweli compara el nombre de una persona u organización con las listas oficiales de sanciones de las Naciones Unidas (ONU), la Unión Europea (UE), el Reino Unido (RU) y Estados Unidos (OFAC SDN). Está pensada para controles PLA básicos. La coincidencia es por tokens: las partes del nombre se comparan en cualquier orden, y las consultas parciales (por ejemplo solo apellido) pueden devolver resultados clasificados con una puntuación.',
  sectionScreenTitle: 'Verificar un nombre',
  sectionScreenBody:
    '1. En la pantalla principal, escriba el nombre de una persona u organización (completo o parcial).\n2. Pulse Verificar.\n3. Lea el resultado:\n   • Rojo — coincidencia fuerte: nombre(s) de alta confianza; se requiere revisión.\n   • Naranja — posible coincidencia: acuerdo parcial de partes del nombre; revise antes de actuar.\n   • Verde — ninguna coincidencia por encima del umbral para esta consulta.\n4. Cada fila muestra el nombre en la lista y una puntuación (0–100%).\n\nConsejos: solo apellido y orden invertido funcionan. Las partes muy cortas (menos de 3 letras) se ignoran. Los nombres de pila muy comunes en consulta única se puntúan con más cautela. Los errores tipográficos aún no tienen coincidencia difusa: pruebe alias conocidos.',
  sectionUpdateTitle: 'Actualizar las listas de sanciones',
  sectionUpdateBody:
    'Las listas se incluyen con la aplicación como datos iniciales. Cada vez que abra la aplicación, si las listas tienen más de 30 días (o siguen siendo datos incluidos), Mkweli descarga y analiza automáticamente las listas oficiales cuando el dispositivo está en línea.\n\nTambién puede actualizar en cualquier momento:\n1. Asegúrese de que el dispositivo tiene Internet.\n2. En la pantalla principal, abra la tarjeta Listas de sanciones.\n3. Pulse Actualizar listas.\n4. Espere a que se descargue cada fuente (ONU, UE, RU, EE. UU.). Se muestra el progreso.\n5. Al terminar, solo se guardan los nombres. Los archivos temporales se eliminan. Las listas anteriores de una fuente solo se reemplazan si la actualización de esa fuente tiene éxito.\n\nSi una fuente falla (red, servidor), la aplicación conserva la última lista válida de esa fuente. Puede reintentarlo más tarde.\n\nAparece un aviso naranja si las listas tienen más de 30 días o aún usan los datos incluidos.',
  sectionStatusTitle: 'Entender el estado de las listas',
  sectionStatusBody:
    '• Última actualización — cuándo se completó la última descarga correcta.\n• Nombres cargados — total aproximado de todas las fuentes.\n• Etiquetas de fuente (ONU / UE / RU / EE. UU.) — cantidad de nombres por lista. “(incluida)” significa que aún se usan los datos integrados. Una advertencia indica que falló la última actualización de esa fuente.',
  sectionOfflineTitle: 'Uso sin conexión',
  sectionOfflineBody:
    'El cribado funciona sin conexión con los nombres ya presentes en el dispositivo (datos incluidos o última descarga correcta). Actualizar las listas requiere Internet. El archivo de EE. UU. (OFAC) es grande y puede tardar varios minutos con una conexión lenta.',
  sectionLimitsTitle: 'Limitaciones importantes',
  sectionLimitsBody:
    '• La coincidencia usa tokens (partes del nombre) con puntuaciones; no es coincidencia difusa de ortografía, identificación biométrica ni un sistema KYC/PLA completo.\n• Un resultado verde / “sin coincidencia por encima del umbral” no demuestra la ausencia de todo riesgo.\n• Las posibles coincidencias exigen revisión humana; apellidos compartidos o nombres de pila comunes pueden referirse a otras personas.\n• Siga siempre la política de cumplimiento de su organización y, cuando corresponda, sistemas de cribado autorizados y revisión humana.\n• El contenido de las listas proviene de fuentes oficiales públicas; Mkweli no modifica esas designaciones.',
};

export const translations: Record<LanguageCode, Record<TranslationKey, string>> =
  {
    en: en as Record<TranslationKey, string>,
    fr,
    pt,
    es,
  };

export function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

export function isLanguageCode(value: string): value is LanguageCode {
  return value === 'en' || value === 'fr' || value === 'pt' || value === 'es';
}
