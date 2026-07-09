'use strict';
/* Règles de tous les jeux — utilisées par la modale ❓ et par regles.html */
window.RULES = {
general: { title:'Bien débuter', html:`
<p><b>Les joueurs.</b> Au lancement de chaque jeu, choisissez le nombre de joueurs (jusqu'à 4)
et, pour chacun, s'il est humain ou tenu par l'ordinateur. Sans ordinateur, jouez à tour de
rôle sur le même téléphone. Le joueur actif est surligné dans la barre des scores.</p>
<p><b>Secouer pour lancer.</b> Activez le bouton 📳 puis secouez le téléphone : cela appuie
sur le bouton principal (Lancer, Relancer…). Sur iPhone, une autorisation est demandée.</p>
<p><b>Les dés.</b> Quand un jeu permet de garder des dés, touchez-les : un anneau doré les
entoure. Le style des dés (12 au choix) se change en haut d'écran et reste mémorisé.</p>`},

'421': { title:'Le 421', html:`
<p>3 dés, 21 fiches au pot. Le but : <b>finir sans fiches</b>.</p>
<p><b>Déroulement.</b> Le meneur lance jusqu'à 3 fois (il peut garder des dés) ; les autres
ont droit au même nombre de lancers maximum. Le <b>perdant du tour</b> (plus mauvaise
combinaison) mène le tour suivant.</p>
<p><b>La charge :</b> le perdant ramasse au pot autant de fiches que vaut la combinaison du
gagnant. <b>La décharge</b> (pot vide) : le gagnant refile ce nombre de fiches au perdant.
Le premier à zéro fiche gagne.</p>
<p><b>Hiérarchie et valeurs :</b> 421 (8 fiches) &gt; brelan d'as 1·1·1 (7) &gt; paire d'as
+ n, 6·1·1 le plus fort (n fiches) &gt; brelan de n (n fiches) &gt; suites 4·5·6 à 1·2·3
(2) &gt; combinaisons simples (1). La <b>nénette</b> 2·2·1 est le pire coup (4 fiches).
Égalité parfaite : <b>rampeau</b>, on se départage.</p>`},

'10000': { title:'Le 10 000', html:`
<p>5 dés. Premier à <b>10 000 points</b>.</p>
<p><b>Ce qui marque :</b> chaque 1 = 100, chaque 5 = 50, brelan de n = n×100 (brelan d'as
= 1000, chaque dé au-delà du brelan double la valeur), suite complète 1-2-3-4-5 ou
2-3-4-5-6 = 1500.</p>
<p><b>Le tour.</b> Lancez les 5 dés, mettez de côté <b>au moins un dé qui marque</b>, puis
relancez le reste ou <b>banquez</b> vos points. Si un lancer ne contient aucun dé qui
marque, le tour est perdu ! Si les 5 dés marquent (« main pleine »), on repart avec les 5
en gardant les points.</p>
<p><b>L'ouverture :</b> il faut marquer au moins 500 points en un seul tour pour commencer
à compter.</p>`},

yams: { title:'Le Yams', html:`
<p>5 dés, 13 tours. Le plus haut total gagne.</p>
<p><b>Le tour.</b> Jusqu'à 3 lancers en gardant les dés de votre choix, puis inscrivez le
résultat dans <b>une case libre</b> de la feuille (quitte à marquer 0).</p>
<p><b>Section haute :</b> As à Six = somme des dés de cette valeur. <b>Bonus de 35</b> si
la section haute atteint 63.</p>
<p><b>Section basse :</b> Brelan et Carré = somme des 5 dés (si 3 ou 4 identiques) ;
Full = 25 ; Petite suite (4 dés qui se suivent) = 30 ; Grande suite (5 dés) = 40 ;
Yams (5 identiques) = 50 ; Chance = somme des 5 dés.</p>`},

poker: { title:'Le Poker d\u2019as', html:`
<p>5 dés, comme une main de poker. Premier à <b>3 manches gagnées</b>.</p>
<p><b>La manche.</b> Chaque joueur lance les 5 dés, garde ce qu'il veut, et relance une
seule fois. La meilleure main l'emporte.</p>
<p><b>Hiérarchie :</b> cinq identiques &gt; carré &gt; full &gt; quinte (1-2-3-4-5 ou
2-3-4-5-6) &gt; brelan &gt; deux paires &gt; paire &gt; hauteur. Départage à la valeur
la plus haute. Égalité parfaite : personne ne marque.</p>`},

zanzibar: { title:'Le Zanzibar', html:`
<p>3 dés, 21 jetons au pot. Quand le pot est vide, celui qui a le <b>moins de jetons</b>
gagne.</p>
<p><b>Déroulement.</b> Comme au 421 : le meneur lance jusqu'à 3 fois (gardes permises) et
fixe le maximum des autres. Le perdant du tour ramasse au pot autant de jetons que vaut
le coup du gagnant, et mène ensuite.</p>
<p><b>Hiérarchie :</b> 4·5·6 « Zanzibar » (4 jetons) &gt; brelan d'as &gt; autres brelans
(3 jetons) &gt; 1·2·3 (2 jetons) &gt; aux points (1 jeton) : l'as vaut 100, le 6 vaut 60,
les autres leur valeur.</p>`},

mexico: { title:'Le Mexico', html:`
<p>2 dés, 3 vies chacun. <b>Dernier survivant</b> gagne.</p>
<p><b>Le score :</b> le plus grand dé forme les dizaines (5 et 3 = 53). Les doubles
battent tout (double 6 le plus fort)… sauf le <b>21, « Mexico »</b>, imbattable.</p>
<p><b>La manche.</b> Le meneur lance jusqu'à 3 fois (on relance les deux dés, le dernier
jet compte) et fixe le maximum des autres. Le plus bas score perd une vie — <b>deux</b>
si le meilleur a fait Mexico. Égalité pour le plus bas : la manche est rejouée. Le perdant
mène ensuite.</p>`},

chicago: { title:'Le Chicago', html:`
<p>2 dés, 11 manches numérotées de <b>2 à 12</b>.</p>
<p>À chaque manche, chaque joueur lance une fois : si la somme des dés égale le numéro de
la manche, il marque ce numéro en points. Après la manche 12, le plus haut total gagne.</p>`},

cochon: { title:'Le Cochon', html:`
<p>1 dé. Premier à <b>100 points</b>.</p>
<p><b>Le tour.</b> Lancez le dé autant de fois que vous osez : chaque face s'ajoute à
votre cagnotte du tour… mais un <b>1</b> efface la cagnotte et rend la main !
<b>Banquez</b> à tout moment pour mettre vos points à l'abri.</p>`},

passedix: { title:'Le Passe-dix', html:`
<p>3 dés. Premier à <b>5 points</b>.</p>
<p>À votre tour, annoncez <b>Passe</b> (la somme fera 11 ou plus) ou <b>Manque</b>
(10 ou moins), puis lancez. Annonce juste : +1 point.</p>`},

boston: { title:'Le Boston', html:`
<p>3 dés, 5 manches. Le plus haut total gagne.</p>
<p><b>La manche.</b> Lancez les 3 dés : le plus fort est mis de côté. Relancez les 2
autres : le plus fort est mis de côté. Relancez le dernier. La somme des trois dés
gardés fait votre score de manche.</p>`},

boite: { title:'La Boîte (Shut the Box)', html:`
<p>2 dés et 9 tuiles numérotées de 1 à 9. Le <b>plus bas score</b> gagne — et fermer
toute la boîte, c'est la victoire immédiate !</p>
<p><b>Le tour.</b> Lancez les dés, puis abaissez des tuiles dont la <b>somme égale le
total des dés</b> (8 = la tuile 8, ou 6+2, ou 5+3, ou 1+3+4…). Rejouez tant que c'est
possible. Quand plus aucune combinaison n'existe, votre score est la somme des tuiles
restées levées.</p>
<p>Quand les tuiles 7, 8 et 9 sont abaissées, vous pouvez choisir de ne lancer qu'un dé.</p>`},

martinetti: { title:'Le Martinetti', html:`
<p>3 dés. Premier à valider la série complète de <b>1 à 12, dans l'ordre</b>.</p>
<p><b>Le tour.</b> Lancez les 3 dés : vous validez le prochain nombre de votre série s'il
apparaît sur un dé seul, sur la somme de deux dés ou des trois (avec 2·3·6 on peut valider
le 2, le 3, le 5, le 6, le 8, le 9, le 11…). On valide autant de nombres consécutifs que
possible avec le même lancer, puis on relance. Un lancer qui ne valide rien rend la main.</p>`},
salon: { title:'Jouer \u00e0 plusieurs t\u00e9l\u00e9phones', html:`
<p>Le <b>Salon</b> connecte 2 \u00e0 4 t\u00e9l\u00e9phones : chacun voit son propre \u00e9cran —
indispensable pour les jeux de cartes o\u00f9 la main reste secr\u00e8te.</p>
<p><b>L'h\u00f4te</b> cr\u00e9e une table et obtient un <b>code de 4 lettres</b> ; les autres
le saisissent pour rejoindre. Une connexion Internet est n\u00e9cessaire pour se trouver,
puis les t\u00e9l\u00e9phones communiquent en direct (id\u00e9alement sur le m\u00eame Wi-Fi ou en
partage de connexion).</p>
<p>L'h\u00f4te <b>choisit le jeu</b> dans le salon puis lance la partie. En r\u00e9seau :
<b>20 jeux</b> : 8 am\u00e9ricain, 8 loco, Pr\u00e9sident, Pouilleux, Menteur, Scopa,
Bataille, Dame de pique, Tarot, Rami, Domino, Matador, Tout-Cinq, Train mexicain,
Awal\u00e9 (et 2-3-4), Kalah, Dames, \u00c9checs et Cochon trou\u00e9 \u2014 soit tous les jeux
de cartes, de dominos et de plateau du comptoir !</p>
<p>Pour offrir le jeu \u00e0 un ami : bouton <b>\ud83d\udce4 Partager l'app</b> sur le menu — l'APK
part par Bluetooth, WhatsApp ou tout autre canal, sans magasin d'applications.</p>
<p><b>Styles de cartes.</b> En jeu, un s\u00e9lecteur permet de choisir parmi 5 jeux de
cartes illustr\u00e9s (dont deux tarots complets de 78 cartes) — chacun choisit le sien
sur son t\u00e9l\u00e9phone.</p>\n<p><b>Nouveau — le mode Table :</b> \u00e0 la cr\u00e9ation, cochez \u00ab \ud83d\udcfa Cet appareil est la Table \u00bb. Posez cette tablette (ou ce t\u00e9l\u00e9phone) au centre : elle affiche le <b>plateau commun</b> que tout le monde voit. Chaque joueur rejoint avec le code et garde sa <b>main priv\u00e9e</b> sur son propre \u00e9cran \u2014 comme une vraie table de jeu !</p>`},

huit: { title:'Le 8 am\u00e9ricain (cartes)', html:`
<p>52 cartes, 2 \u00e0 4 joueurs, chacun sur son t\u00e9l\u00e9phone. Le premier \u00e0 <b>vider sa
main</b> gagne.</p>
<p><b>Le tour.</b> Posez une carte de la <b>m\u00eame couleur</b> ou de la <b>m\u00eame valeur</b>
que la carte du dessus. Les <b>8 sont ma\u00eetres</b> : jouables sur tout, ils permettent
de choisir la couleur demand\u00e9e.</p>
<p>Rien \u00e0 jouer ? <b>Piochez une carte</b> : si elle est jouable vous pouvez la poser,
sinon (ou si vous pr\u00e9f\u00e9rez) vous passez. Pioche vide : la d\u00e9fausse est rebattue.</p>
<p>On distribue 7 cartes \u00e0 2 joueurs, 5 \u00e0 3 ou 4.</p>`},
bataille: { title:'La Bataille', html:`
<p>Jeu de 52 cartes, 2 joueurs. Le paquet est partag\u00e9 en deux. \u00c0 chaque tour, chacun
retourne sa carte du dessus : la plus forte rafle les deux (l'As est la plus forte, puis
Roi, Dame, Valet, 10\u20262).</p>
<p><b>Bataille !</b> \u00c9galit\u00e9 : on pose 3 cartes cach\u00e9es puis une face visible ; la plus
forte emporte tout le tas. Le premier \u00e0 rafler les 52 cartes gagne. Aucun choix : c'est
le hasard pur, id\u00e9al pour d\u00e9couvrir.</p>`},

president: { title:'Le Pr\u00e9sident', html:`
<p>52 cartes, 3 \u00e0 4 joueurs, tout le paquet distribu\u00e9. But : se d\u00e9barrasser de ses
cartes le premier pour devenir <b>Pr\u00e9sident</b> ; le dernier est le <b>Trou du cul</b>.</p>
<p><b>Ordre des cartes :</b> 3 (faible) &lt; 4 &lt; \u2026 &lt; 10 &lt; V &lt; D &lt; R &lt; As
&lt; <b>2 (la plus forte)</b>.</p>
<p><b>Le jeu.</b> Le meneur pose une carte ou un groupe de m\u00eame valeur (paire, brelan,
carr\u00e9). Chacun \u00e0 son tour doit poser <b>le m\u00eame nombre de cartes</b>, de valeur
<b>strictement sup\u00e9rieure</b>, ou passer. Quand tout le monde passe, le dernier \u00e0 avoir
pos\u00e9 ramasse la main et relance.</p>`},

huit: { title:'Le 8 loco', html:`
<p>52 cartes, 2 \u00e0 4 joueurs. Comme le 8 am\u00e9ricain, mais avec des cartes qui piquent.
Premier \u00e0 vider sa main gagne.</p>
<p>Posez une carte de m\u00eame <b>couleur</b> ou m\u00eame <b>valeur</b>. Les <b>8</b> sont
ma\u00eetres (choisissez la couleur). Cartes sp\u00e9ciales : le <b>2</b> fait piocher 2 cartes au
suivant (cumulable si lui aussi pose un 2), le <b>Valet</b> saute le joueur suivant, l'<b>As</b>
change le sens du jeu (\u00e0 2 joueurs, il fait rejouer). Rien \u00e0 poser ? Piochez.</p>`},
tarot: { title:'Le Tarot (simplifi\u00e9)', html:`
<p>Jeu de <b>78 cartes</b> \u00e0 4 joueurs. Version simplifi\u00e9e, <b>sans ench\u00e8res</b> :
chacun joue pour soi et ramasse le plus de <b>points</b> possible dans ses plis.</p>
<p><b>Les cartes.</b> Quatre couleurs de 14 cartes (As\u2026 10, Valet, Cavalier, Dame, Roi),
21 <b>atouts</b> num\u00e9rot\u00e9s, et l'<b>Excuse</b>. Les atouts battent toutes les couleurs ;
l'atout 21 est le plus fort, l'atout 1 (le « Petit ») le plus faible.</p>
<p><b>Jouer.</b> On doit fournir la couleur demand\u00e9e ; \u00e0 d\u00e9faut, on est oblig\u00e9 de
<b>couper \u00e0 l'atout</b> (et de monter plus haut qu'un atout d\u00e9j\u00e0 pos\u00e9 si possible).
L'<b>Excuse</b> se joue quand on veut, ne remporte jamais le pli, et reste dans vos points.</p>
<p><b>Les points</b> (les fameux « bouts ») : le 21, le Petit (atout 1) et l'Excuse valent
4,5 chacun ; Roi 4,5 ; Dame 3,5 ; Cavalier 2,5 ; Valet 1,5 ; les autres 0,5. Le dernier pli
ramasse le <b>chien</b> (6 cartes mises de c\u00f4t\u00e9). 91 points en jeu : le plus haut total gagne.</p>`},
hearts: { title:'La Dame de pique', html:`
<p>52 cartes, 4 joueurs. On joue des donnes jusqu'\u00e0 ce qu'un joueur atteigne 50 points :
le <b>plus petit score gagne</b>. Le but est d'\u00e9viter de ramasser des points.</p>
<p><b>Points :</b> chaque <b>c\u0153ur</b> vaut 1, la <b>Dame de pique</b> vaut 13.</p>
<p><b>Jouer.</b> Le d\u00e9tenteur du 2 de tr\u00e8fle entame. On doit fournir la couleur demand\u00e9e ;
\u00e0 d\u00e9faut, on d\u00e9fausse ce qu'on veut. On ne peut pas entamer c\u0153ur tant qu'un c\u0153ur n'a pas
\u00e9t\u00e9 d\u00e9fauss\u00e9. La plus forte carte de la couleur d'entame remporte le pli\u2026 et ses points.</p>
<p><b>La Lune :</b> ramasser \u00e0 soi seul <b>tous</b> les points d'une donne (26) rapporte 0
au h\u00e9ros et inflige 26 \u00e0 chacun des autres !</p>`},

pouilleux: { title:'Le Pouilleux (Mistigri)', html:`
<p>2 \u00e0 4 joueurs. On retire une dame du paquet : sa jumelle devient le <b>Pouilleux</b>,
la carte solitaire que personne ne veut garder. Le premier d\u00e9barrass\u00e9 de ses cartes
gagne ; celui qui reste avec le Pouilleux \u00e0 la fin a perdu.</p>
<p><b>D\u00e9roulement.</b> On \u00e9carte d'abord toutes ses <b>paires</b> (deux cartes de m\u00eame
valeur). Puis, chacun \u00e0 son tour, on <b>pioche une carte cach\u00e9e</b> chez le voisin : si
elle compl\u00e8te une paire, on la jette. On continue jusqu'\u00e0 ce qu'il ne reste qu'un joueur,
tenant la dame solitaire.</p>`},
scopa: { title:'La Scopa', html:`
<p>Jeu italien \u00e0 40 cartes (on retire les 8, 9 et 10), 2 \u00e0 4 joueurs. On <b>ramasse</b>
des cartes de la table, et on marque des points \u00e0 la fin de chaque donne. Premier \u00e0
<b>11 points</b>.</p>
<p><b>Valeurs :</b> As = 1, 2 \u00e0 7 \u00e0 leur valeur, Valet = 8, Dame = 9, Roi = 10.</p>
<p><b>Jouer.</b> Posez une carte : si elle a la m\u00eame valeur qu'une carte de la table, ou
si elle \u00e9gale la <b>somme</b> de plusieurs cartes, vous les ramassez (avec la v\u00f4tre). Une
carte identique est prioritaire sur une somme. Sinon, la carte reste sur la table.</p>
<p><b>La scopa (\ud83e\uddf9) :</b> ramasser <b>toute la table</b> d'un coup rapporte 1 point
bonus. En fin de donne, on compte : le plus de <b>cartes</b> (+1), le plus de <b>deniers</b>
(carreau, +1), le <b>7 de carreau</b> « settebello » (+1), plus les scope.</p>`},
menteur: { title:'Le Menteur', html:`
<p>52 cartes, 2 \u00e0 4 joueurs, chacun sa main cach\u00e9e. Premier \u00e0 <b>vider sa main</b>
sans se faire prendre gagne.</p>
<p><b>Jouer.</b> \u00c0 chaque tour, la valeur \u00e0 annoncer est <b>impos\u00e9e</b> et monte \u00e0
chaque fois (As, puis 2, puis 3\u2026). Posez 1 \u00e0 4 cartes <b>face cach\u00e9e</b> en annon\u00e7ant
cette valeur \u2014 en disant la v\u00e9rit\u00e9\u2026 ou en <b>bluffant</b> avec d'autres cartes !</p>
<p><b>Menteur !</b> Apr\u00e8s chaque annonce, les autres peuvent crier « Menteur ! ». On
retourne les cartes pos\u00e9es : si le joueur mentait, <b>il ramasse tout le tas</b> ; s'il
disait vrai, c'est le <b>douteur</b> qui ramasse. Le ramasseur relance \u00e0 l'As.</p>`},
rami: { title:'Le Rami', html:`
<p>52 cartes, 2 \u00e0 4 joueurs. Le premier \u00e0 <b>vider sa main</b> gagne. Si la pioche
s'\u00e9puise, c'est le joueur avec le <b>moins de cartes non combin\u00e9es</b> qui l'emporte.</p>
<p><b>Combinaisons :</b> le <b>brelan</b> (3 ou 4 cartes de m\u00eame valeur, couleurs
diff\u00e9rentes) et la <b>suite</b> (au moins 3 cartes qui se suivent dans la m\u00eame couleur,
l'As \u00e9tant bas).</p>
<p><b>Le tour.</b> 1) <b>Piochez</b> une carte (la pioche, ou la carte du dessus de la
d\u00e9fausse). 2) <b>Posez</b> vos combinaisons sur la table et <b>\u00e9talez</b> des cartes sur
les combinaisons d\u00e9j\u00e0 pos\u00e9es (les v\u00f4tres ou celles des autres). 3) <b>D\u00e9faussez</b>
une carte pour finir votre tour.</p>
<p>Le nombre de cartes distribu\u00e9es : 10 \u00e0 deux joueurs, 7 \u00e0 trois ou quatre.</p>`},
domino: { title:'Le Domino', html:`
<p>Jeu de dominos double-six (28 tuiles), 2 \u00e0 4 joueurs. Le premier \u00e0 <b>poser toutes
ses tuiles</b> gagne. Si le jeu se bloque, le plus petit total de points en main l'emporte.</p>
<p><b>Distribution :</b> 7 tuiles \u00e0 deux joueurs, 5 \u00e0 trois ou quatre. Le reste forme la
<b>pioche</b>. Celui qui a le plus gros double (ou la plus grosse tuile) ouvre.</p>
<p><b>Le tour.</b> Posez une tuile dont l'une des valeurs correspond \u00e0 l'un des <b>deux
bouts</b> de la cha\u00eene (gauche ou droite). Si vous ne pouvez pas jouer, <b>piochez</b>
jusqu'\u00e0 le pouvoir ; si la pioche est vide, vous <b>passez</b>.</p>`},
toutcinq: { title:'Le Tout-Cinq (All Fives)', html:`
<p>Dominos double-six, 2 \u00e0 4 joueurs. Comme au domino classique (on pose sur les deux
bouts, on pioche sinon), mais on <b>marque des points</b>. Premier \u00e0 <b>100</b> gagne.</p>
<p><b>Marquer :</b> apr\u00e8s votre pose, si la <b>somme des deux bouts</b> de la cha\u00eene est
un multiple de 5 (5, 10, 15, 20\u2026), vous marquez cette somme. Un double compte double
(un 5-5 \u00e0 un bout vaut 10).</p>
<p><b>Fin de manche :</b> celui qui sort (ou, si bloqu\u00e9, celui qui a le moins de points en
main) marque le total des tuiles adverses, arrondi au multiple de 5 le plus proche.</p>`},

matador: { title:'Le Matador', html:`
<p>Dominos double-six, 2 \u00e0 4 joueurs. Variante o\u00f9 l'on ne raccorde pas les valeurs
\u00e9gales : la tuile et le bout doivent <b>totaliser 7</b>. Premier \u00e0 tout poser gagne.</p>
<p>Sur un bout qui montre 3, il faut donc jouer une tuile ayant un <b>4</b> (3+4=7) ; sur un
5, il faut un 2, etc. Un bout \u00e0 <b>blanc (0)</b> ne peut \u00eatre continu\u00e9 que par un
<b>matador</b>.</p>
<p><b>Les matadors</b> (les tuiles qui totalisent 7 : 6-1, 5-2, 4-3, et le double-blanc 0-0)
sont des <b>jokers</b> : ils se posent sur n'importe quel bout, et vous choisissez alors la
valeur expos\u00e9e. Ils sont surlign\u00e9s en rouge dans votre main.</p>`},
train: { title:'Le Train mexicain', html:`
<p>Dominos double-six, 2 \u00e0 4 joueurs. Le <b>6-6</b> est le moteur central : tous les
trains d\u00e9marrent sur la valeur 6. Chaque joueur a <b>son train</b> ; il existe aussi un
<b>Train mexicain</b> commun. Premier \u00e0 vider son jeu gagne (sinon, plus petit total).</p>
<p><b>Le tour.</b> Posez une tuile au bout d'un train autoris\u00e9 : le <b>v\u00f4tre</b>, le
<b>Mexicain</b>, ou le train <b>ouvert</b> 🔓 d'un autre joueur. La valeur doit correspondre
au bout du train.</p>
<p><b>Doubles :</b> jouer un double vous fait <b>rejouer</b> une tuile. Si vous ne pouvez pas
jouer, vous <b>piochez</b> ; toujours rien ? votre train <b>s'ouvre</b> (les autres peuvent
y jouer) et vous passez. En jouant sur votre propre train ouvert, vous le refermez.</p>`},
awale: { title:"L'Awal\u00e9 (Oware)", html:`
<p>Jeu de semailles africain (famille mancala), \u00e0 2 joueurs. Le plateau a <b>12 trous</b>
(6 par joueur, votre rang\u00e9e devant vous) et 2 <b>greniers</b>. On d\u00e9marre avec
<b>4 graines</b> par trou (48 en tout). Le but : r\u00e9colter le <b>plus de graines</b>
(25 assurent la victoire).</p>
<p><b>Semer.</b> \u00c0 votre tour, prenez toutes les graines d'un de <b>vos</b> trous et
d\u00e9posez-les une par une dans les trous suivants, dans le sens <b>anti-horaire</b>.</p>
<p><b>Capturer.</b> Si votre <b>derni\u00e8re</b> graine tombe dans un trou <b>adverse</b> qui
compte alors <b>2 ou 3</b> graines, vous les r\u00e9coltez \u2014 ainsi que les trous adverses
pr\u00e9c\u00e9dents contigus \u00e0 2 ou 3. Une prise qui viderait <b>tout</b> le camp adverse
est refus\u00e9e (les graines restent).</p>
<p><b>Nourrir.</b> Si l'adversaire n'a plus de graines, vous <b>devez</b> jouer un coup qui lui
en donne. Sinon la partie s'ach\u00e8ve et chacun r\u00e9colte son camp.</p>`},
kalah: { title:'Le Kalah', html:`
<p>Version « occidentale » du mancala, \u00e0 2 joueurs, sur le m\u00eame plateau (12 trous +
2 greniers, 4 graines par trou). Le plus de graines dans son grenier gagne.</p>
<p><b>Semer.</b> Prenez un de vos trous et semez anti-horaire, <b>en incluant votre propre
grenier</b> (\u00e0 votre droite) mais en <b>sautant</b> celui de l'adversaire.</p>
<p><b>Rejouer :</b> si votre derni\u00e8re graine tombe dans <b>votre grenier</b>, vous
<b>rejouez</b> aussit\u00f4t.</p>
<p><b>Capturer :</b> si votre derni\u00e8re graine atterrit dans un de <b>vos</b> trous
<b>vide</b>, vous raflez cette graine <b>et toutes celles du trou d'en face</b>.</p>
<p>La partie s'arr\u00eate d\u00e8s qu'un camp est vide ; l'autre joueur ramasse ses graines
restantes.</p>`},

awale234: { title:'Awalé « prise 2-3-4 »', html:`
<p>Variante plus vive de l'Awal\u00e9. Toutes les r\u00e8gles sont identiques, mais on
<b>capture aussi les trous qui atteignent 4</b> (en plus de 2 et 3). Les prises sont donc
plus fr\u00e9quentes et les parties plus rapides \u2014 id\u00e9al pour d\u00e9buter.</p>`},
cochontroue: { title:'Le Cochon troué (Pig Hole)', html:`
<p>Jeu de d\u00e9, 2 \u00e0 6 joueurs. Chacun re\u00e7oit des cochons ; le <b>premier \u00e0 s'en
d\u00e9barrasser</b> gagne, et le dernier qui en garde a perdu. (Version rapide, normale ou
officielle au lancement.)</p>
<p><b>Le tour.</b> On lance <b>un d\u00e9</b> et on place un cochon dans le trou du num\u00e9ro
obtenu (1 \u00e0 5). Un <b>6</b> envoie un cochon par le <b>trou du milieu</b> : il sort
d\u00e9finitivement du jeu.</p>
<p><b>Attention :</b> si le trou tir\u00e9 est <b>d\u00e9j\u00e0 occup\u00e9</b>, vous devez
<b>ramasser tous les cochons</b> pr\u00e9sents sur le plateau, et votre tour s'arr\u00eate.</p>
<p><b>Stop ou encore :</b> au 1er tour on lance une fois, au 2e deux fois ; \u00e0 partir du 3e
tour on relance tant qu'on veut \u2014 mais un trou occup\u00e9 met fin au tour. \u00c0 vous de savoir
vous arr\u00eater !</p>`},
dames: { title:'Les Dames', html:`
<p>Sur les cases fonc\u00e9es d'un damier 8\u00d78, 12 pions chacun. Les <b>Blancs</b> (en bas)
commencent. Gagne celui qui <b>prend ou bloque</b> toutes les pi\u00e8ces adverses.</p>
<p><b>D\u00e9placement.</b> Un pion avance d'une case en <b>diagonale</b>, vers l'avant.</p>
<p><b>La prise est obligatoire.</b> On saute par-dessus une pi\u00e8ce adverse voisine pour
retomber juste derri\u00e8re (le pion prend aussi en <b>arri\u00e8re</b>). Les prises s'encha\u00eenent
en <b>rafle</b>, et l'on doit jouer le coup qui prend le <b>plus de pi\u00e8ces</b> (prise
majoritaire).</p>
<p><b>La dame.</b> Un pion qui <b>termine</b> son coup sur la derni\u00e8re rang\u00e9e est couronn\u00e9
\ud83d\udc51. La dame est <b>volante</b> : elle glisse d'autant de cases qu'elle veut en
diagonale, et capture \u00e0 distance en s'arr\u00eatant o\u00f9 elle veut derri\u00e8re sa victime.</p>
<p><b>Nul :</b> 25 coups de dames sans prise ni avanc\u00e9e de pion.</p>`},
echecs: { title:'Les \u00c9checs', html:`
<p>Le grand classique : mettre le roi adverse <b>\u00e9chec et mat</b>. Les Blancs (en bas)
commencent.</p>
<p><b>D\u00e9placements :</b> le pion avance d'une case (deux depuis sa position initiale) et
prend en diagonale ; la tour suit lignes et colonnes ; le fou les diagonales ; la dame les
deux ; le cavalier saute en \u00ab L \u00bb ; le roi bouge d'une case.</p>
<p><b>Coups sp\u00e9ciaux :</b> le <b>roque</b> (roi + tour, si ni l'un ni l'autre n'a boug\u00e9
et si le roi ne traverse pas de case attaqu\u00e9e), la <b>prise en passant</b>, et la
<b>promotion</b> d'un pion arriv\u00e9 au bout (choisissez sa nouvelle pi\u00e8ce).</p>
<p><b>\u00c9chec :</b> un roi attaqu\u00e9 doit \u00eatre mis \u00e0 l'abri imm\u00e9diatement \u2014 le jeu
ne propose que les coups l\u00e9gaux. <b>Mat</b> = victoire ; <b>pat</b> (aucun coup l\u00e9gal sans
\u00eatre en \u00e9chec), 50 coups sans prise ni pion, ou triple r\u00e9p\u00e9tition = <b>nulle</b>.</p>`},
uno: { title:'UNO', html:`
<p>2 \u00e0 4 joueurs, 7 cartes chacun. But : <b>se d\u00e9barrasser de toutes ses cartes</b>.</p>
<p><b>Jouer.</b> \u00c0 votre tour, posez une carte de <b>m\u00eame couleur</b> ou de <b>m\u00eame
valeur</b> que celle du dessus. Sinon, <b>piochez</b> : si la carte pioch\u00e9e est jouable, vous
pouvez la poser, sinon le tour passe.</p>
<p><b>Cartes sp\u00e9ciales :</b> <b>Passer</b> (⊘) saute le joueur suivant ; <b>Inverser</b> (↯)
change le sens (\u00e0 2, elle fait rejouer) ; <b>+2</b> fait piocher deux cartes au suivant, qui
passe son tour.</p>
<p><b>Jokers (noirs) :</b> le <b>Joker</b> se joue sur n'importe quoi et vous choisissez la couleur ;
le <b>+4</b> fait en plus piocher <b>quatre</b> cartes au suivant.</p>
<p>Le premier joueur sans carte gagne la manche.</p>`},
p4: { title:'Puissance 4', html:`
<p>2 joueurs, un plateau de <b>7 colonnes</b> et <b>6 rang\u00e9es</b>. Chacun sa couleur
(rouge / jaune).</p>
<p><b>Jouer.</b> \u00c0 votre tour, touchez une colonne : votre jeton <b>tombe</b> sur la pile.</p>
<p><b>Gagner.</b> Le premier \u00e0 <b>aligner quatre</b> jetons de sa couleur \u2014 en ligne,
en colonne ou en <b>diagonale</b> \u2014 remporte la partie. Plateau plein sans alignement : <b>nul</b>.</p>`},
echelles: { title:'Jeu des \u00e9chelles', html:`
<p>1 \u00e0 5 joueurs. Chacun choisit un pion et le place au d\u00e9part. \u00c0 son tour, on
<b>lance le d\u00e9</b> et on avance d'autant de cases.</p>
<p><b>Les \u00e9chelles</b> font grimper : si vous terminez au pied d'une \u00e9chelle, vous montez
directement \u00e0 son sommet \u2014 un raccourci vers la victoire !</p>
<p>Le premier \u00e0 atteindre la <b>case 100</b> gagne. Si votre d\u00e9 vous ferait d\u00e9passer 100,
vous <b>rebondissez</b> en arri\u00e8re du nombre de cases en trop.</p>`},
oiedelirant: { title:'L\u2019oie délirante', html:`
<p>1 \u00e0 5 joueurs, 72 cases compl\u00e8tement loufoques. Chacun choisit un pion, lance le
<b>d\u00e9</b> et avance.</p>
<p><b>Chaque case a un effet !</b> Quand vous vous arr\u00eatez dessus, une <b>grande carte</b>
s\u2019affiche : lisez-la, cliquez OK, et l\u2019effet s\u2019applique \u2014 avancer, reculer,
sauter jusqu\u2019\u00e0 une case, ou passer son tour. Attention aux surprises !</p>
<p>Le premier \u00e0 atteindre la <b>case 72</b> (l\u2019arriv\u00e9e) devient l\u2019oie l\u00e9gendaire. \ud83c\udfc6</p>`},
oieclassique: { title:'Le jeu de l\u2019oie', html:`
<p>Le grand classique ! 1 \u00e0 5 joueurs lancent le d\u00e9 et avancent le long de la spirale
jusqu\u2019\u00e0 la <b>case 63</b>.</p>
<p><b>Les oies</b> (cases 5, 9, 14\u2026) te font <b>rejouer</b> aussitôt du même nombre \u2014
de belles acc\u00e9l\u00e9rations ! Mais gare aux pi\u00e8ges : le <b>pont</b> (6), l\u2019<b>auberge</b>
(19), le <b>puits</b> (31), le <b>labyrinthe</b> (42), la <b>prison</b> (52) et la redoutable
<b>t\u00eate de mort</b> (58) qui te renvoie au d\u00e9part !</p>
<p>Pour gagner, il faut tomber <b>pile</b> sur la 63 : si tu d\u00e9passes, tu <b>rebondis</b> en arri\u00e8re.</p>`},
oiedelirant108: { title:'L\u2019oie délirante géante', html:`
<p>La version XXL : <b>108 cases</b> en serpentin, encore plus de folie ! 1 \u00e0 5 joueurs, on
lance le d\u00e9 et on lit la <b>grande carte</b> de chaque case o\u00f9 l\u2019on s\u2019arr\u00eate.</p>
<p>Surprises \u00e0 gogo, quelques <b>pi\u00e8ges</b> (trous, serpents, soucoupes\u2026) et de bons
<b>raccourcis</b> (ponts, dragons\u2026). Premier \u00e0 la <b>case 108</b> gagne !</p>`},
reversi: { title:'Reversi / Othello', html:`
<p>2 joueurs, l\u2019un <b>noir</b>, l\u2019autre <b>blanc</b>, sur une grille 8\u00d78.</p>
<p><b>Le principe :</b> \u00e0 votre tour, posez un pion de sorte \u00e0 <b>encercler</b> une ou
plusieurs lignes de pions adverses entre votre nouveau pion et un pion \u00e0 vous. Tous les pions
encercl\u00e9s se <b>retournent</b> \u00e0 votre couleur ! Un coup n\u2019est valable que s\u2019il
retourne au moins un pion.</p>
<p>Si vous ne pouvez pas jouer, vous passez. \u00c0 la fin (plateau plein ou deux passes),
le joueur qui a le <b>plus de pions</b> gagne.</p>
<p><b>Deux d\u00e9parts au choix :</b> <b>Othello</b> (4 pions plac\u00e9s au centre) ou <b>Reversi</b>
(plateau vide, on remplit d\u2019abord les 4 cases centrales).</p>`},
monopoly: { title:'Le Grand Marchand (Monopoly)', html:`
<p>Le c\u00e9l\u00e8bre jeu de commerce ! Chacun choisit un pion, d\u00e9marre avec <b>1500\ud83d\udcb0</b>,
lance <b>deux d\u00e9s</b> et fait le tour du plateau. Deux ambiances : <b>\u00e0 l\u2019ancienne</b> ou
<b>futuriste</b>.</p>
<p><b>Achetez</b> les propri\u00e9t\u00e9s libres o\u00f9 vous tombez ; si elles appartiennent \u00e0 un
autre joueur, payez-lui un <b>loyer</b> (double si toute la couleur est \u00e0 lui ; les gares et services
rapportent selon leur nombre). En passant par le <b>D\u00e9part</b>, touchez 200. Piochez <b>Chance</b> et
<b>Caisse de Commerce</b>. La <b>prison</b> vous bloque jusqu\u2019\u00e0 un double (ou 50\ud83d\udcb0).</p>
<p>Un joueur \u00e0 court d\u2019argent fait <b>faillite</b> : le dernier marchand solvable gagne !</p>
<p>Poss\u00e9dez toute une <b>couleur</b> pour b\u00e2tir des <b>maisons</b> puis un <b>h\u00f4tel</b> : les loyers grimpent en fl\u00e8che ! <i>\u00c0 venir : le mode r\u00e9seau.</i></p>`},
};
