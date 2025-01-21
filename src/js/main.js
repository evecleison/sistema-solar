// Importando bibliotecas necessárias
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

// Algumas variáveis globais
let corposCriados = []; // Lista para armazenar os planetas, Lua e Sol criados
let orbitasVisible = false; // Define se as órbitas são visíveis
let corpoFocado = 'Sol'; // Corpo celestial em foco
let speeds = { rotation: 1, translation: 1 }; // Velocidades padrão
const textureLoader = new THREE.TextureLoader(); // Carregador de texturas dos corpos celestes
const orbitas = []; // Array para armazenar as órbitas

// Criando a cena e a câmera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 1000);
camera.position.set(0, 50, 200);

// Configuração do renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controle da câmera
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Adicionando uma luz ambiente
const luzAmbiente = new THREE.AmbientLight(0xffffff, 1.5); // Intensidade da luz ambiente
scene.add(luzAmbiente);

// Adicionando cenário
const loader = new THREE.CubeTextureLoader();
const cenario = loader.load([
  '/textures/skybox/px.png', '/textures/skybox/nx.png',
  '/textures/skybox/py.png', '/textures/skybox/ny.png',
  '/textures/skybox/pz.png', '/textures/skybox/nz.png',
]);
scene.background = cenario;

// Dados do sol, planetas e da lua
const celestialBodies = [
  { nome: 'Sol', raio: 10, distancia: 0, texture: 'sol.jpg', translation_speed: 0, rotation_speed: 0, rotation_direction: 0, isSun: true },
  { nome: 'Mercúrio', raio: 2, distancia: 15, texture: 'mercurio.jpg', translation_speed: 16.48, rotation_speed: 0.004, rotation_direction: 1 },
  { nome: 'Vênus', raio: 3, distancia: 30, texture: 'venus.jpg', translation_speed: 8.4, rotation_speed: 0.001, rotation_direction: -1 },
  { nome: 'Terra', raio: 3.5, distancia: 45, texture: 'terra.jpg', translation_speed: 2.946, rotation_speed: 0.0042, rotation_direction: 1 },
  { nome: 'Lua', raio: 1, distancia: 10, texture: 'lua.jpg', translation_speed: 9, rotation_speed: 0.00027, rotation_direction: 1, isMoon: true },
  { nome: 'Marte', raio: 2.5, distancia: 60, texture: 'marte.jpg', translation_speed: 1.186, rotation_speed: 0.0041, rotation_direction: 1 },
  { nome: 'Jupiter', raio: 7, distancia: 85, texture: 'jupiter.jpg', translation_speed: 0.188, rotation_speed: 0.1, rotation_direction: 1 },
  { nome: 'Saturno', raio: 6, distancia: 110, texture: 'saturno.jpg', translation_speed: 0.1, rotation_speed: 0.085, rotation_direction: 1, hasRings: true },
  { nome: 'Urano', raio: 5.1, distancia: 135, texture: 'urano.jpg', translation_speed: 0.062, rotation_speed: 0.03, rotation_direction: -1 },
  { nome: 'Netuno', raio: 5, distancia: 160, texture: 'netuno.jpg', translation_speed: 0.024, rotation_speed: 0.018, rotation_direction: 1 },
];

// Construção do sistema solar
celestialBodies.forEach((dados) => {

  let material;

  // Formação dos corpos celestes
  if(!dados.isSun){
    material = new THREE.MeshStandardMaterial({
      map: textureLoader.load(`/textures/${dados.texture}`),
    });
  }else{
    material = new THREE.MeshBasicMaterial({
      map: textureLoader.load(`/textures/${dados.texture}`),
    });
  }
  const geometry = new THREE.SphereGeometry(dados.raio, 32, 32);
  const corpoCeleste = new THREE.Mesh(geometry, material);

  if (!dados.isMoon) {
    corpoCeleste.position.set(dados.distancia, 0, 0);
  } else {
    const terra = corposCriados.find((b) => b.nome === 'Terra');
    corpoCeleste.position.set(terra.mesh.position.x + dados.distancia, 0, 0);
  }

  // Adiciona órbitas visuais, se necessário
  if (!dados.isMoon && !dados.isSun) {
    const orbitaGeometry = new THREE.RingGeometry(dados.distancia - 0.1, dados.distancia + 0.1, 64);
    const orbitaMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const orbita = new THREE.Mesh(orbitaGeometry, orbitaMaterial);
    orbita.rotation.x = Math.PI / 2;
    scene.add(orbita);
    orbitas.push(orbita);
    orbita.visible = orbitasVisible;
  }

  corposCriados.push({
    nome: dados.nome,
    mesh: corpoCeleste,
    distancia: dados.distancia,
    translation_speed: dados.translation_speed,
    rotation_speed: dados.rotation_speed, // Adicionando a velocidade de rotação
    rotation_direction: dados.rotation_direction, // Adicionando a direção da rotação
    isMoon: dados.isMoon || false,
  });
  
  if (dados.hasRings) {
    const anelTexture = textureLoader.load('/textures/anelSaturno.jpg');
    const anelMaterial = new THREE.MeshStandardMaterial({ map: anelTexture, side: THREE.DoubleSide });
    const anelGeometry = new THREE.RingGeometry(7, 12, 64);
    const anel = new THREE.Mesh(anelGeometry, anelMaterial);
    anel.rotation.x = Math.PI / 2;
    corpoCeleste.add(anel);
  }

  scene.add(corpoCeleste);
});


// Criar a interface com lil-gui
const gui = new GUI();
gui.add(
  { Foco: corpoFocado },
  'Foco',
  corposCriados.filter((b) => !b.isMoon).map((b) => b.nome) // Exclui corpos com isMoon: true
).onChange((valor) => {
  corpoFocado = valor;
}).name("Corpo celeste focado");

// Ajusta a largura do contêiner da GUI
document.querySelector('.lil-gui').style.width = '300px';

// Controle de velocidades
gui.add(speeds, 'rotation', 0.1, 1000, 0.1).name('Velocidade de rotação');
gui.add(speeds, 'translation', 0.1, 1000, 0.1).name('Velocidade de translação');

// Controle de órbitas
gui.add({ Orbitas: orbitasVisible }, 'Orbitas').onChange((valor) => {
  orbitasVisible = valor;
  orbitas.forEach((orbita) => {
    orbita.visible = valor;
  });
}).name("Órbitas visíveis");

// Animação
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.0001; // Verificar a passagem de tempo

  // Atualizar posições dos corpos celestes
  corposCriados.forEach((corpo) => {
    if (corpo.nome !== 'Sol') {
      const angulo = time * corpo.translation_speed * speeds.translation;
      const x = corpo.distancia * Math.cos(angulo);
      const z = corpo.distancia * Math.sin(angulo);

      if (!corpo.isMoon) {
        corpo.mesh.position.set(x, 0, z);
      } else {
        const terra = corposCriados.find((b) => b.nome === 'Terra');
        corpo.mesh.position.set(terra.mesh.position.x + x, 0, terra.mesh.position.z + z);
      }

      // Aplica a rotação com direção
      corpo.mesh.rotation.y += corpo.rotation_speed * speeds.rotation * corpo.rotation_direction;
    }
  });

  // Atualizar a posição da câmera de forma instantânea
  if (corpoFocado !== 'Sol') {
    const corpo = corposCriados.find((b) => b.nome === corpoFocado);
    const offset = 25; // Distância fixa da câmera em relação ao corpo
    const angulo = time * corpo.translation_speed * speeds.translation;
    const x = corpo.distancia * Math.cos(angulo);
    const z = corpo.distancia * Math.sin(angulo);
    camera.position.set(
      x + offset * Math.cos(angulo),
      corpo.mesh.position.y + 5,
      z + offset * Math.sin(angulo)
    );
    camera.lookAt(corpo.mesh.position); // A câmera sempre olha para o corpo focado
    controls.enabled = false; // Desativar controles manuais ao seguir um corpo
  } else {
    controls.enabled = true; // Permitir controle manual para o Sol
  }
    
  // Atualizar controles e renderizar a cena
  controls.update();
  renderer.render(scene, camera);
}

animate();
