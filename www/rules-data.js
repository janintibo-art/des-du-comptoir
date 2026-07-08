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
};
