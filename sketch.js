let jeu;
let sliderSensi;

// ==========================================
// CLASSE 1 : LA CIBLE (Évolutive)
// ==========================================
class Cible {
  constructor() {
    this.respawn();
  }

  respawn() {
    this.r = random(15, 35);
    this.x = random(this.r, width - this.r);
    this.y = random(100 + this.r, height - this.r);
  }

  // NOUVEAU : La couleur change selon le score !
  obtenirCouleur(scoreActuel) {
    if (scoreActuel < 10) return '#00FF00';      // Débutant : Vert
    if (scoreActuel < 20) return '#FFFF00';      // Échauffé : Jaune
    if (scoreActuel < 30) return '#FFA500';      // Rapide : Orange
    if (scoreActuel < 40) return '#FF0000';      // Pro : Rouge
    return '#FF00FF';                            // God Mode : Violet Néon
  }

  afficher(scoreActuel) {
    fill(this.obtenirCouleur(scoreActuel)); // Applique la couleur dynamique
    noStroke();
    circle(this.x, this.y, this.r * 2);
  }

  estTouchee(viseurX, viseurY) {
    return dist(viseurX, viseurY, this.x, this.y) < this.r;
  }
}

// ==========================================
// CLASSE 2 : LE VISEUR
// ==========================================
class Viseur {
  constructor() {
    this.centrer();
  }

  mettreAJour(sensi) {
    this.x = constrain(this.x + movedX * sensi, 0, width);
    this.y = constrain(this.y + movedY * sensi, 0, height);
  }

  afficher() {
    stroke(255);
    strokeWeight(2);
    line(this.x - 15, this.y, this.x + 15, this.y);
    line(this.x, this.y - 15, this.x, this.y + 15);
  }

  centrer() {
    this.x = width / 2;
    this.y = height / 2;
  }
}

// ==========================================
// CLASSE 3 : LE MOTEUR DE JEU
// ==========================================
class MoteurJeu {
  constructor() {
    this.cible = new Cible();
    this.viseur = new Viseur();
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // NOUVEAU : On commence sur un écran d'accueil
    this.etat = "ACCUEIL"; 
  }

  demarrerPartie() {
    this.score = 0;
    this.clics = 0;
    this.tempsRestant = 30;
    this.etat = "JEU";
    this.viseur.centrer();
    this.cible.respawn();
    if (sliderSensi) sliderSensi.show();
    
    // On débloque l'audio du navigateur au tout premier clic
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
  }

  jouerSonHit() {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
    
    osc.start(this.audioCtx.currentTime);
    osc.stop(this.audioCtx.currentTime + 0.1);
  }

  gererFrame(sensi) {
    if (this.etat === "ACCUEIL") {
      this.afficherAccueil();
    } 
    else if (this.etat === "JEU") {
      this.tempsRestant -= deltaTime / 1000;
      
      if (this.tempsRestant <= 0) {
        this.terminerPartie();
      } else {
        this.viseur.mettreAJour(sensi);
        this.cible.afficher(this.score); // On passe le score à la cible
        this.viseur.afficher();
        this.afficherHUD(sensi);
      }
    } 
    else if (this.etat === "FIN") {
      this.afficherEcranFin();
    }
  }

  terminerPartie() {
    this.tempsRestant = 0;
    this.etat = "FIN";
    document.exitPointerLock();
    if (sliderSensi) sliderSensi.hide();
  }

  gererClic() {
    if (this.etat === "ACCUEIL") {
      requestPointerLock(); // Bloque la souris
      this.demarrerPartie(); // Lance le timer
    } 
    else if (this.etat === "JEU") {
      requestPointerLock(); // Sécurité au cas où on perd le focus
      this.clics++;
      if (this.cible.estTouchee(this.viseur.x, this.viseur.y)) {
        this.score++;
        this.jouerSonHit();
        this.cible.respawn();
      }
    }
  }

  // --- INTERFACE ---
  afficherAccueil() {
    if (sliderSensi) sliderSensi.hide(); // Cache le slider au début
    textAlign(CENTER, CENTER);
    fill(255); noStroke();
    textSize(50);
    text("AIM LAB MMI", width / 2, height / 2 - 50);
    fill('#00FF00');
    textSize(20);
    text("⚠️ CLIQUEZ N'IMPORTE OÙ POUR VERROUILLER LE CURSEUR ⚠️", width / 2, height / 2 + 20);
    fill(150);
    textSize(16);
    text("Tirez sur les cibles. Appuyez sur Échap pour quitter.", width / 2, height / 2 + 70);
  }

  afficherHUD(sensi) {
    fill(255); noStroke(); textAlign(LEFT, BASELINE); textSize(24);
    text(`Score : ${this.score}`, 180, 40);
    textAlign(CENTER, BASELINE);
    text(`Temps : ${Math.ceil(this.tempsRestant)}s`, width / 2, 40);
    textAlign(LEFT, BASELINE); textSize(14);
    text(`Sensibilité : ${sensi}`, 20, 60);
  }

  afficherEcranFin() {
    let precision = this.clics > 0 ? Math.round((this.score / this.clics) * 100) : 0;
    let rang = "D"; let couleurRang = '#FF0000';
    if (precision >= 90) { rang = "S"; couleurRang = '#FFD700'; }
    else if (precision >= 80) { rang = "A"; couleurRang = '#00FF00'; }
    else if (precision >= 60) { rang = "B"; couleurRang = '#00BFFF'; }
    else if (precision >= 40) { rang = "C"; couleurRang = '#FFA500'; }

    textAlign(CENTER, CENTER); fill(255); noStroke();
    textSize(50); text("TEMPS ÉCOULÉ", width / 2, height / 2 - 120);
    textSize(30); text(`Score : ${this.score}`, width / 2, height / 2 - 40);
    text(`Précision : ${precision}%`, width / 2, height / 2 + 10);
    textSize(60); fill(couleurRang); text(`Rang : ${rang}`, width / 2, height / 2 + 90);
    textSize(20); fill(150); text("Appuyez sur 'R' pour rejouer", width / 2, height / 2 + 160);
  }
}

// ==========================================
// FONCTIONS P5.JS
// ==========================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();
  sliderSensi = createSlider(0.1, 3, 1, 0.1);
  sliderSensi.position(20, 20);
  jeu = new MoteurJeu();
}

function draw() {
  background(26);
  jeu.gererFrame(sliderSensi.value());
}

function mousePressed() {
  jeu.gererClic();
}

function keyPressed() {
  if (key.toLowerCase() === 'r') {
    // Si on fait R, on repasse par l'accueil pour forcer le clic de sécurité
    jeu.etat = "ACCUEIL";
    document.exitPointerLock(); 
  }
}
