// --- VARIABLES GLOBALES (Réduites au strict minimum) ---
let jeu;
let sliderSensi;

// ==========================================
// CLASSE 1 : LA CIBLE
// ==========================================
class Cible {
  constructor() {
    this.respawn(); // Place la cible aléatoirement dès sa création
  }

  // Méthode pour (ré)apparaître
  respawn() {
    this.r = random(15, 35);
    this.x = random(this.r, width - this.r);
    this.y = random(100 + this.r, height - this.r);
  }

  // Méthode pour se dessiner
  afficher() {
    fill('#00FF00');
    noStroke();
    circle(this.x, this.y, this.r * 2);
  }

  // Méthode pour vérifier si elle est touchée
  estTouchee(viseurX, viseurY) {
    return dist(viseurX, viseurY, this.x, this.y) < this.r;
  }
}

// ==========================================
// CLASSE 2 : LE VISEUR
// ==========================================
class Viseur {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
  }

  // Méthode pour se déplacer selon la sensibilité
  mettreAJour(sensi) {
    this.x = constrain(this.x + movedX * sensi, 0, width);
    this.y = constrain(this.y + movedY * sensi, 0, height);
  }

  // Méthode pour se dessiner
  afficher() {
    stroke(255);
    strokeWeight(2);
    line(this.x - 15, this.y, this.x + 15, this.y);
    line(this.x, this.y - 15, this.x, this.y + 15);
  }

  // Remet le viseur au centre
  centrer() {
    this.x = width / 2;
    this.y = height / 2;
  }
}

// ==========================================
// CLASSE 3 : LE MOTEUR DE JEU (Game Manager)
// ==========================================
class MoteurJeu {
  constructor() {
    this.cible = new Cible();
    this.viseur = new Viseur();
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.demarrerPartie();
  }

  demarrerPartie() {
    this.score = 0;
    this.clics = 0;
    this.tempsRestant = 30;
    this.etat = "JEU";
    this.viseur.centrer();
    this.cible.respawn();
    if (sliderSensi) sliderSensi.show();
  }

  jouerSonHit() {
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
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

  // Boucle principale du jeu
  gererFrame(sensi) {
    if (this.etat === "JEU") {
      this.tempsRestant -= deltaTime / 1000;
      
      if (this.tempsRestant <= 0) {
        this.terminerPartie();
      } else {
        this.viseur.mettreAJour(sensi);
        this.cible.afficher();
        this.viseur.afficher();
        this.afficherHUD(sensi);
      }
    } else if (this.etat === "FIN") {
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
    if (this.etat === "JEU") {
      requestPointerLock();
      this.clics++;
      
      if (this.cible.estTouchee(this.viseur.x, this.viseur.y)) {
        this.score++;
        this.jouerSonHit();
        this.cible.respawn();
      }
    }
  }

  // --- INTERFACE ---
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
// FONCTIONS P5.JS (Gèrent la boucle et les events)
// ==========================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();
  
  sliderSensi = createSlider(0.1, 3, 1, 0.1);
  sliderSensi.position(20, 20);
  
  // On instancie notre Moteur de Jeu
  jeu = new MoteurJeu();
}

function draw() {
  background(26);
  // On délègue tout le travail à la classe Jeu
  jeu.gererFrame(sliderSensi.value());
}

function mousePressed() {
  jeu.gererClic();
}

function keyPressed() {
  if (key.toLowerCase() === 'r') {
    jeu.demarrerPartie();
  }
}