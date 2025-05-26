import React, { useState } from 'react';
import { X } from 'lucide-react';

// Modal de détail d'une condition
export const ModalDetailCondition = ({ condition, onClose }) => {
  if (!condition) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{condition.nom}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-gray-700">{condition.description}</p>
        </div>
      </div>
    </div>
  );
};

// Modal de détail d'un monstre
export function ModalDetailMonstre({ monstre, onClose }) {
  // Fonction utilitaire pour générer l'URL AideDD
  function getAideDDUrl(nom) {
    // Mapping des noms français vers les noms anglais pour AideDD
    const nomMapping = {
      'Aarakocra': 'aarakocra',
      'Aboleth': 'aboleth',
      'Ankheg': 'ankheg',
      'Basilic': 'basilisk',
      'Behir': 'behir',
      'Bulette': 'bulette',
      'Carrion Crawler': 'carrion-crawler',
      'Chimère': 'chimera',
      'Cockatrice': 'cockatrice',
      'Couatl': 'couatl',
      'Displacer Beast': 'displacer-beast',
      'Doppelganger': 'doppelganger',
      'Dragon': 'dragon',
      'Dragonne': 'dragonne',
      'Drider': 'drider',
      'Dryade': 'dryad',
      'Ettin': 'ettin',
      'Flumph': 'flumph',
      'Gargouille': 'gargoyle',
      'Gelatinous Cube': 'gelatinous-cube',
      'Ghast': 'ghast',
      'Ghost': 'ghost',
      'Ghoul': 'ghoul',
      'Giant': 'giant',
      'Gibbering Mouther': 'gibbering-mouther',
      'Githyanki': 'githyanki',
      'Githzerai': 'githzerai',
      'Gnoll': 'gnoll',
      'Gnome': 'gnome',
      'Gobelin': 'goblin',
      'Gorgon': 'gorgon',
      'Grell': 'grell',
      'Grimlock': 'grimlock',
      'Guardian Naga': 'guardian-naga',
      'Hag': 'hag',
      'Harpy': 'harpy',
      'Hippogriff': 'hippogriff',
      'Hobgoblin': 'hobgoblin',
      'Hook Horror': 'hook-horror',
      'Hydra': 'hydra',
      'Intellect Devourer': 'intellect-devourer',
      'Invisible Stalker': 'invisible-stalker',
      'Jackalwere': 'jackalwere',
      'Kenku': 'kenku',
      'Kobold': 'kobold',
      'Kraken': 'kraken',
      'Lamia': 'lamia',
      'Lich': 'lich',
      'Lizardfolk': 'lizardfolk',
      'Lycanthrope': 'lycanthrope',
      'Magmin': 'magmin',
      'Manticore': 'manticore',
      'Medusa': 'medusa',
      'Merfolk': 'merfolk',
      'Mimic': 'mimic',
      'Mind Flayer': 'mind-flayer',
      'Minotaur': 'minotaur',
      'Mummy': 'mummy',
      'Mummy Lord': 'mummy-lord',
      'Naga': 'naga',
      'Nightmare': 'nightmare',
      'Ogre': 'ogre',
      'Ogre Mage': 'ogre-mage',
      'Oni': 'oni',
      'Orc': 'orc',
      'Otyugh': 'otyugh',
      'Owlbear': 'owlbear',
      'Pegasus': 'pegasus',
      'Peryton': 'peryton',
      'Phase Spider': 'phase-spider',
      'Piercer': 'piercer',
      'Pixie': 'pixie',
      'Pseudodragon': 'pseudodragon',
      'Purple Worm': 'purple-worm',
      'Quasit': 'quasit',
      'Rakshasa': 'rakshasa',
      'Roc': 'roc',
      'Roper': 'roper',
      'Rust Monster': 'rust-monster',
      'Sahuagin': 'sahuagin',
      'Salamander': 'salamander',
      'Satyr': 'satyr',
      'Scorpion': 'scorpion',
      'Shadow': 'shadow',
      'Shambling Mound': 'shambling-mound',
      'Shield Guardian': 'shield-guardian',
      'Skeleton': 'skeleton',
      'Sphinx': 'sphinx',
      'Sprite': 'sprite',
      'Stirge': 'stirge',
      'Succubus': 'succubus',
      'Tarrasque': 'tarrasque',
      'Thri-kreen': 'thri-kreen',
      'Tiger': 'tiger',
      'Treant': 'treant',
      'Troll': 'troll',
      'Umber Hulk': 'umber-hulk',
      'Unicorn': 'unicorn',
      'Vampire': 'vampire',
      'Vampire Spawn': 'vampire-spawn',
      'Veteran': 'veteran',
      'Vrock': 'vrock',
      'Wight': 'wight',
      'Will-o-wisp': 'will-o-wisp',
      'Wraith': 'wraith',
      'Wyvern': 'wyvern',
      'Xorn': 'xorn',
      'Yeti': 'yeti',
      'Yuan-ti': 'yuan-ti',
      'Zombie': 'zombie'
    };

    // Utiliser le mapping ou générer un slug à partir du nom
    const slug = nomMapping[nom] || nom.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `https://www.aidedd.org/dnd/monstres.php?vf=${slug}`;
  }

  const [imgError, setImgError] = useState(0); // 0: rien, 1: png fail, 2: jpg fail

  if (!monstre) return null;

  const baseName = monstre.image || `/images/monstres/${monstre.nom?.toLowerCase().normalize('NFD').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  let imageUrl = '';
  if (imgError === 0) imageUrl = baseName + '.png';
  else if (imgError === 1) imageUrl = baseName + '.jpg';
  else imageUrl = '/images/monstres/placeholder.png';

  // Fonction pour formater les caractéristiques
  const formatCarac = (value) => {
    const mod = Math.floor((value - 10) / 2);
    return `${value} (${mod >= 0 ? '+' : ''}${mod})`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full p-0 relative overflow-y-auto max-h-[90vh] flex flex-col md:flex-row shadow-2xl">
        {/* Colonne gauche : infos */}
        <div className="flex-1 min-w-0 p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>

          {/* Nom et sous-titre */}
          <h2 className="text-3xl font-extrabold text-red-900 mb-1 tracking-wide uppercase">{monstre.nom}</h2>
          <div className="text-md text-gray-700 italic mb-4">
            {monstre.type} (taille {monstre.taille}, {monstre.alignement})
            {monstre.legendaire && <span className="ml-2 text-purple-700 font-semibold">Légendaire</span>}
          </div>

          {/* Statistiques principales */}
          <div className="flex items-center gap-4 mb-4 text-base font-semibold">
            <span>CA <span className="text-gray-900">{monstre.ca}</span></span>
            <span className="text-gray-400">|</span>
            <span>PV <span className="text-gray-900">{monstre.pv}</span></span>
            <span className="text-gray-400">|</span>
            <span>Vitesse <span className="text-gray-900">{monstre.vitesse || '-'}</span></span>
            <span className="text-gray-400">|</span>
            <span>CR <span className="text-gray-900">{monstre.cr}</span></span>
          </div>

          {/* Caractéristiques */}
          <div className="mb-4">
            <div className="grid grid-cols-6 gap-2 bg-yellow-50 rounded-lg p-2 border">
              {[{ name: 'FOR', value: monstre.force },
                { name: 'DEX', value: monstre.dexterite },
                { name: 'CON', value: monstre.constitution },
                { name: 'INT', value: monstre.intelligence },
                { name: 'SAG', value: monstre.sagesse },
                { name: 'CHA', value: monstre.charisme }].map(carac => (
                <div key={carac.name} className="text-center">
                  <div className="text-xs text-gray-600 font-bold">{carac.name}</div>
                  <div className="text-lg font-bold text-gray-900">{formatCarac(carac.value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Jets de sauvegarde */}
          {monstre.jds && Object.keys(monstre.jds).length > 0 && (
            <div className="mb-2">
              <h3 className="text-md font-bold text-blue-900 mb-1">Jets de sauvegarde</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(monstre.jds).map(([carac, bonus]) => (
                  <span key={carac} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {carac.toUpperCase()} +{bonus}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Résistances et immunités */}
          {(monstre.resistance?.length > 0 || monstre.immunite?.length > 0) && (
            <div className="mb-2">
              <h3 className="text-md font-bold text-green-900 mb-1">Résistances & Immunités</h3>
              <div className="flex flex-wrap gap-2">
                {monstre.resistance?.map(res => (
                  <span key={res} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Résistance à {res}</span>
                ))}
                {monstre.immunite?.map(imm => (
                  <span key={imm} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Immunité à {imm}</span>
                ))}
              </div>
            </div>
          )}

          {/* Sens et langues */}
          <div className="flex flex-wrap gap-4 mb-2 text-sm text-gray-700">
            {monstre.sens && <span><span className="font-semibold">Sens :</span> {monstre.sens}</span>}
            {monstre.langues && <span><span className="font-semibold">Langues :</span> {monstre.langues}</span>}
          </div>

          {/* Traits */}
          {monstre.traits?.length > 0 && (
            <div className="mb-2">
              <h3 className="text-md font-bold text-blue-900 mb-1">Traits</h3>
              <div className="space-y-2">
                {monstre.traits.map(trait => (
                  <div key={trait.nom} className="bg-blue-50 p-2 rounded">
                    <span className="font-semibold text-blue-800">{trait.nom}.</span> <span className="text-gray-800">{trait.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {monstre.actions?.length > 0 && (
            <div className="mb-2">
              <h3 className="text-md font-bold text-red-900 mb-1">Actions</h3>
              <div className="space-y-2">
                {monstre.actions.map(action => (
                  <div key={action.nom} className="bg-red-50 p-2 rounded">
                    <span className="font-semibold text-red-800">{action.nom}.</span> <span className="text-gray-800">{action.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bouton AideDD */}
          <div className="flex justify-end mt-6">
            <a
              href={getAideDDUrl(monstre.nom)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-yellow-200 text-yellow-900 font-bold rounded shadow hover:bg-yellow-300 transition"
            >
              Voir sur AideDD
            </a>
          </div>
        </div>
        {/* Colonne droite : image de la créature */}
        <div className="hidden md:flex w-80 flex-shrink-0 h-full bg-yellow-50 border-l border-yellow-200 p-0 flex-col items-center justify-center" style={{ minHeight: '340px' }}>
          {monstre.image || monstre.nom ? (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <img
                src={imageUrl}
                alt={monstre.nom}
                className="object-contain h-full w-auto max-h-[340px] max-w-[320px]"
                onError={() => { if (imgError === 0) setImgError(1); else if (imgError === 1) setImgError(2); }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <img src="/images/monstres/placeholder.png" alt="placeholder" className="object-contain h-full w-auto max-h-[340px] max-w-[320px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 