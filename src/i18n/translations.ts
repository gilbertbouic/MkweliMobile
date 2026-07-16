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
  resultClear: 'Not sanctioned: No match found.',
  emptyHint: 'Enter a name and tap Screen to check against sanctions lists.',
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
    'Mkweli screens a person or organisation name against official sanctions lists from the United Nations (UN), European Union (EU), United Kingdom (UK), and United States (OFAC SDN). It is intended for basic AML name checks. Results are exact name matches only (case-insensitive).',
  sectionScreenTitle: 'Screen a name',
  sectionScreenBody:
    '1. On the main screen, type the full name in the search field.\n2. Tap Screen.\n3. Read the result:\n   • Red — “Sanctioned: Match found in database.” The name matches an entry on one or more lists.\n   • Green — “Not sanctioned: No match found.” No exact match was found.\n\nTips: Try alternate spellings, order of names, and common aliases if you expect a hit. Matching is exact after trimming spaces; partial names will not match.',
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
    '• This tool checks exact name strings only; it is not fuzzy matching, identity verification, or a full KYC/AML system.\n• A “not sanctioned” result does not prove a person is clear of all risk.\n• Always follow your organisation’s compliance policy and, where required, use authorised screening systems and human review.\n• List content comes from public official sources; Mkweli does not alter those designations.',
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
  resultClear: 'Non sanctionné : aucune correspondance.',
  emptyHint:
    'Saisissez un nom et appuyez sur Contrôler pour le vérifier dans les listes de sanctions.',
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
    'Mkweli compare le nom d’une personne ou d’une organisation aux listes officielles de sanctions des Nations Unies (ONU), de l’Union européenne (UE), du Royaume-Uni (RU) et des États-Unis (OFAC SDN). Elle est destinée à des contrôles LBA basiques. Les résultats sont des correspondances exactes de noms uniquement (sans distinction de majuscules).',
  sectionScreenTitle: 'Contrôler un nom',
  sectionScreenBody:
    '1. Sur l’écran principal, saisissez le nom complet dans le champ de recherche.\n2. Appuyez sur Contrôler.\n3. Lisez le résultat :\n   • Rouge — « Sanctionné : correspondance trouvée. » Le nom figure sur une ou plusieurs listes.\n   • Vert — « Non sanctionné : aucune correspondance. » Aucune correspondance exacte.\n\nAstuces : essayez d’autres orthographes, l’ordre des noms et les alias courants. La correspondance est exacte après suppression des espaces ; les noms partiels ne correspondent pas.',
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
    '• Cet outil vérifie uniquement des chaînes de noms exactes ; ce n’est pas une recherche floue, une vérification d’identité ni un système KYC/LBA complet.\n• Un résultat « non sanctionné » ne prouve pas l’absence de tout risque.\n• Respectez toujours la politique de conformité de votre organisation et, le cas échéant, des systèmes de filtrage autorisés et une revue humaine.\n• Le contenu des listes provient de sources officielles publiques ; Mkweli ne modifie pas ces désignations.',
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
  resultClear: 'Não sancionado: nenhuma correspondência.',
  emptyHint:
    'Introduza um nome e toque em Verificar para consultar as listas de sanções.',
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
    'O Mkweli compara o nome de uma pessoa ou organização com listas oficiais de sanções das Nações Unidas (ONU), União Europeia (UE), Reino Unido (RU) e Estados Unidos (OFAC SDN). Destina-se a controlos ALD básicos. Os resultados são apenas correspondências exatas de nomes (sem distinção de maiúsculas).',
  sectionScreenTitle: 'Verificar um nome',
  sectionScreenBody:
    '1. No ecrã principal, escreva o nome completo no campo de pesquisa.\n2. Toque em Verificar.\n3. Leia o resultado:\n   • Vermelho — “Sancionado: correspondência encontrada.” O nome consta de uma ou mais listas.\n   • Verde — “Não sancionado: nenhuma correspondência.” Não foi encontrada correspondência exata.\n\nDicas: experimente grafias alternativas, ordem dos nomes e pseudónimos comuns. A correspondência é exata após remover espaços; nomes parciais não correspondem.',
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
    '• Esta ferramenta verifica apenas cadeias de nomes exatas; não é correspondência aproximada, verificação de identidade nem um sistema KYC/ALD completo.\n• Um resultado “não sancionado” não prova ausência de todo o risco.\n• Siga sempre a política de conformidade da sua organização e, quando necessário, sistemas de triagem autorizados e revisão humana.\n• O conteúdo das listas provém de fontes oficiais públicas; o Mkweli não altera essas designações.',
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
  resultClear: 'No sancionado: no se encontró coincidencia.',
  emptyHint:
    'Introduzca un nombre y pulse Verificar para consultarlo en las listas de sanciones.',
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
    'Mkweli compara el nombre de una persona u organización con las listas oficiales de sanciones de las Naciones Unidas (ONU), la Unión Europea (UE), el Reino Unido (RU) y Estados Unidos (OFAC SDN). Está pensada para controles PLA básicos. Los resultados son solo coincidencias exactas de nombres (sin distinguir mayúsculas).',
  sectionScreenTitle: 'Verificar un nombre',
  sectionScreenBody:
    '1. En la pantalla principal, escriba el nombre completo en el campo de búsqueda.\n2. Pulse Verificar.\n3. Lea el resultado:\n   • Rojo — “Sancionado: coincidencia encontrada.” El nombre figura en una o más listas.\n   • Verde — “No sancionado: no se encontró coincidencia.” No hubo coincidencia exacta.\n\nConsejos: pruebe ortografías alternativas, el orden de los nombres y alias habituales. La coincidencia es exacta tras quitar espacios; los nombres parciales no coinciden.',
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
    '• Esta herramienta solo comprueba cadenas de nombres exactas; no es coincidencia aproximada, verificación de identidad ni un sistema KYC/PLA completo.\n• Un resultado “no sancionado” no demuestra la ausencia de todo riesgo.\n• Siga siempre la política de cumplimiento de su organización y, cuando corresponda, sistemas de cribado autorizados y revisión humana.\n• El contenido de las listas proviene de fuentes oficiales públicas; Mkweli no modifica esas designaciones.',
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
