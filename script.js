// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log("Sistema cargado - Versión Móvil Compatible");

    // --- LÓGICA DE INICIO Y AUDIO ---
    const btnIniciar = document.getElementById('btn-iniciar');
    const audioFondo = document.getElementById('audio-fondo');
    
    // Lista de reproducción
    const playlist = ['luna.mp3', 'ingle.mp3', 'reik.mp3', 'peso.mp3', 'horas.mp3'];
    
    // Función unificada para manejar el inicio (Click o Touch)
    const handleInicio = function(e) {
        // Evitar doble disparo (click y touch a la vez)
        if (e.cancelable) e.preventDefault(); 
        
        // Reproducir el audio inicial
        if(audioFondo) {
            // NOTA: En móviles NO se debe definir el volumen por código (da error en iOS)
            // El usuario usa los botones físicos de su celular.
            
            const playPromise = audioFondo.play();
            
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    console.log("Audio iniciado correctamente");
                })
                .catch(error => {
                    console.log("El navegador bloqueó el autoplay. Intenta tocar de nuevo.");
                });
            }
        }
        
        // Iniciar la galaxia
        iniciarGalaxia();

        // Remover listeners para que no se ejecute dos veces
        btnIniciar.removeEventListener('click', handleInicio);
        btnIniciar.removeEventListener('touchstart', handleInicio);
    };

    // Escuchamos ambos eventos para máxima compatibilidad móvil
    btnIniciar.addEventListener('click', handleInicio);
    btnIniciar.addEventListener('touchstart', handleInicio, {passive: false});


    // --- FUNCIÓN DE TRANSICIÓN Y CREACIÓN DE UI ---
    function iniciarGalaxia() {
        const paginaBienvenida = document.getElementById('pagina-bienvenida');
        const paginaGalaxia = document.getElementById('pagina-galaxia');
        
        // Transición suave
        paginaBienvenida.classList.add('ocultar');
        
        setTimeout(() => {
            paginaBienvenida.style.display = 'none';
            paginaGalaxia.style.display = 'block';
            
            // Crear el botón de música dinámicamente
            crearBotonMusica();
            
            iniciarVisualizacion();
        }, 800);
    }

    // --- FUNCIÓN PARA CREAR EL BOTÓN DE MÚSICA ---
    function crearBotonMusica() {
        const btnMusica = document.createElement('button');
        btnMusica.innerHTML = "🎵 Cambiar Música";
        btnMusica.style.position = 'fixed';
        btnMusica.style.top = '20px';
        btnMusica.style.right = '20px';
        btnMusica.style.padding = '10px 20px';
        btnMusica.style.background = 'rgba(255, 20, 147, 0.3)'; // Rosa transparente
        btnMusica.style.color = 'white';
        btnMusica.style.border = '1px solid white';
        btnMusica.style.borderRadius = '20px';
        btnMusica.style.cursor = 'pointer';
        btnMusica.style.zIndex = '1000';
        btnMusica.style.backdropFilter = 'blur(5px)';
        btnMusica.style.transition = 'all 0.3s ease';
        btnMusica.style.fontFamily = 'Arial, sans-serif';
        // Ajuste para móviles: evitar que el botón sea muy pequeño al tacto
        btnMusica.style.minHeight = '44px'; 
        btnMusica.style.touchAction = 'manipulation';

        // Lógica al hacer click / touch
        const cambiarCancion = (e) => {
            // Evitar propagación si es touch
            if(e.type === 'touchstart') e.preventDefault();

            if(audioFondo) {
                const currentSrc = audioFondo.src.split('/').pop(); 
                let newTrack;
                
                // Algoritmo para no repetir canción
                if(playlist.length > 1) {
                    do {
                        const randomIndex = Math.floor(Math.random() * playlist.length);
                        newTrack = playlist[randomIndex];
                    } while (newTrack === currentSrc || (audioFondo.src.includes(newTrack)));
                } else {
                    newTrack = playlist[0];
                }

                // 2. Efecto de cambio SEGURO PARA MÓVILES
                audioFondo.pause();
                audioFondo.src = newTrack;
                
                // Importante en móviles: cargar antes de reproducir
                audioFondo.load(); 
                
                audioFondo.play()
                    .then(() => console.log(`Reproduciendo: ${newTrack}`))
                    .catch(e => console.error("Error al cambiar música en móvil", e));
                
                // Feedback visual
                const originalText = "🎵 Cambiar Música";
                btnMusica.innerHTML = "✨ Reproduciendo...";
                setTimeout(() => btnMusica.innerHTML = originalText, 1500);
            }
        };

        btnMusica.addEventListener('click', cambiarCancion);
        btnMusica.addEventListener('touchstart', cambiarCancion, {passive: false});

        document.body.appendChild(btnMusica);
    }

    // --- LÓGICA PRINCIPAL DE THREE.JS ---
    function iniciarVisualizacion() {
        // 1. CONFIGURACIÓN BÁSICA
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        const container = document.getElementById('galaxy-container');
        if(container) {
            container.appendChild(renderer.domElement);
        }
        
        camera.position.set(0, 50, 250);

        const clock = new THREE.Clock();

        // 2. CONTROLES BLINDADOS
        let ControlsConstructor;
        if (THREE.OrbitControls) {
            ControlsConstructor = THREE.OrbitControls;
        } else if (window.OrbitControls) {
            ControlsConstructor = window.OrbitControls;
        } else {
            console.error("Error: OrbitControls no encontrado.");
            return;
        }

        const controls = new ControlsConstructor(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 50;
        controls.maxDistance = 1500;
        controls.enableZoom = true;
        controls.enablePan = true;
        controls.autoRotate = false;
        controls.rotateSpeed = 0.5;
        controls.zoomSpeed = 1.2;
        
        // 3. GALAXIA DE PARTÍCULAS
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 15000;
        const posArray = new Float32Array(particlesCount * 3);
        const colorArray = new Float32Array(particlesCount * 3);
        const sizeArray = new Float32Array(particlesCount);
        
        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            posArray[i3] = (Math.random() - 0.5) * 3000; 
            posArray[i3 + 1] = (Math.random() - 0.5) * 3000;
            posArray[i3 + 2] = (Math.random() - 0.5) * 3000;
            sizeArray[i] = Math.random() * 2 + 0.5;
            
            const colorChoice = Math.random();
            if (colorChoice < 0.6) {
                colorArray[i3] = 1; colorArray[i3 + 1] = 1; colorArray[i3 + 2] = 1;
            } else if (colorChoice < 0.8) {
                colorArray[i3] = 0.8; colorArray[i3 + 1] = 0.9; colorArray[i3 + 2] = 1;
            } else {
                colorArray[i3] = 1; colorArray[i3 + 1] = 0.9; colorArray[i3 + 2] = 0.6;
            }
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
        
        const particlesMaterial = new THREE.PointsMaterial({ 
            size: 1.5, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true
        });
        const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particleMesh);

        // ESTRELLAS DESTELLANTES
        const twinkleStarsGeometry = new THREE.BufferGeometry();
        const twinkleCount = 500;
        const twinklePos = new Float32Array(twinkleCount * 3);
        const twinklePhase = new Float32Array(twinkleCount);
        
        for (let i = 0; i < twinkleCount; i++) {
            const i3 = i * 3;
            twinklePos[i3] = (Math.random() - 0.5) * 3000;
            twinklePos[i3 + 1] = (Math.random() - 0.5) * 3000;
            twinklePos[i3 + 2] = (Math.random() - 0.5) * 3000;
            twinklePhase[i] = Math.random() * Math.PI * 2;
        }
        
        twinkleStarsGeometry.setAttribute('position', new THREE.BufferAttribute(twinklePos, 3));
        const twinkleMaterial = new THREE.PointsMaterial({
            size: 4, color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, sizeAttenuation: true
        });
        const twinkleStars = new THREE.Points(twinkleStarsGeometry, twinkleMaterial);
        scene.add(twinkleStars);

        let moonMesh, moonGlow, textMesh;
        let phraseMeshes = [];
        let comets = [];

        // 4. LUNA
        const moonGeometry = new THREE.SphereGeometry(40, 64, 64);
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#8A8A8A');
        gradient.addColorStop(0.5, '#B0B0B0');
        gradient.addColorStop(1, '#8A8A8A');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Cráteres
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 30 + 5;
            const craterGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            craterGradient.addColorStop(0, '#4A4A4A');
            craterGradient.addColorStop(0.5, '#6A6A6A');
            craterGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = craterGradient;
            ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        }
        
        const moonTexture = new THREE.CanvasTexture(canvas);
        const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture, blending: THREE.AdditiveBlending });
        moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
        scene.add(moonMesh);

        const glowGeometry = new THREE.SphereGeometry(55, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xCCCCDD, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending
        });
        moonGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        scene.add(moonGlow);

        // 5. COMETAS
        function createComet() {
            const cometGroup = new THREE.Group();
            const nucleus = new THREE.Mesh(
                new THREE.SphereGeometry(3, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xCCDDFF, blending: THREE.AdditiveBlending })
            );
            cometGroup.add(nucleus);
            
            for (let i = 0; i < 25; i++) {
                const size = 2.8 - (i * 0.1);
                const tailSegment = new THREE.Mesh(
                    new THREE.SphereGeometry(size, 8, 8),
                    new THREE.MeshBasicMaterial({ 
                        color: 0x99BBFF, transparent: true, opacity: 0.7 - (i * 0.028), blending: THREE.AdditiveBlending
                    })
                );
                tailSegment.position.z = -i * 6;
                cometGroup.add(tailSegment);
            }
            
            const angle = Math.random() * Math.PI * 2;
            const radius = 900 + Math.random() * 600;
            cometGroup.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 700, Math.sin(angle) * radius);
            
            const targetAngle = angle + Math.PI;
            const speed = 0.6 + Math.random() * 1.2;
            cometGroup.userData = {
                velocityX: Math.cos(targetAngle) * speed,
                velocityY: (Math.random() - 0.5) * 0.4,
                velocityZ: Math.sin(targetAngle) * speed,
                lifeTime: 0,
                maxLifeTime: 450 + Math.random() * 250
            };
            
            scene.add(cometGroup);
            return cometGroup;
        }

        for (let i = 0; i < 6; i++) { comets.push(createComet()); }

        // 6. TEXTOS Y EMOJIS
        const frases = [
            "quien te quiere como el nene?",
            "me hiciste ser mejor me queda agredecer.",
            
             "Me encanta tus ojos cuando me miras",
            "cada noche de llamada contigo es mi momento favorito del dia",
            "Mi corazon siempre esta contigo, mi vida",
            "Mi imillita hermosa, te llevo en mi corazon a cada segundo",
            "Ver peliculas en Netflix contigo es mejor que cualquier cine",
            "Nuestras llamadas son el mejor momento de mis dias",
            "Eres la mujer perfecta para mi, mi vida",
            "Espero con ansias el dia en que pueda darte todos los besos que te debo",
            " eres mi sol y mi luz",
            "Aun recuerdo tu carita en la primera noche de novios",
            "La distancia no es nada cuando el amor es todo mi amor",
            "Cada conversacion nocturna contigo me hace dormir feliz",
            "Te amo mas alla de las estrellas",
            "Nuestros sueños juntos son mi promesa de amor eterno",
            "Estoy impaciente por abrazarte y no soltarte nunca",
            "TE BESARE HASTA QUE TE ABURRAS DE MI ",
            "Cada mensaje tuyo ilumina mi pantalla y mi vida",
            "Nuestro amor es infinito, ",
            "Cuando estemos juntos, te dare todas las caricias que he guardado",
            ,
            
            "Te quiero muchisisisimo",
            ,
            " eres la razon por la que sonrio cada noche",
            "Cada pelicula que vemos juntos es especial porque estas tu",
            "La espera vale la pena porque al final estare contigo todos los dias",
            "Eres mi compañera de vida",
            "Tu amor hace que la distancia sea solo un detalle",
            " eres mi mayor bendicion",
            "tu risa en las llamadas es mi cancion favorita",
            "Nos contamos nuestras vidas cada noche y nunca me canso de escucharte",
            
            "Me haces sentir el hombre mas afortunado del mundo",
            "La distancia nos hace mas fuertes, mi amor",
            "Cada dia que pasa es un dia menos para estar juntos",
            " eres mi inspiracion diaria",
            "Nuestras noches de conversacion son mejor que cualquier salida",
            "Te amo en la distancia, te amare mas en la cercania",
            "Nuestros corazones estan siempre juntos",
            "eres la dueña de mi corazon",
            "Cada momento contigo es como estar en el paraiso",
            "tu amor hace que valga la pena cada momento de espera",
            "me caes mal",
            "Eres mi todo",
            "tu amor me mantiene vivo",
            "Mi vida, eres mi persona favorita en todo el universo",
            "La distancia es temporal, nuestro amor es eterno",
            "Cada noche me duermo pensando en ti, mi niña",
            "Eres mi amor, mi amiga,  mi vida entera",
            
            "Mi corazon late mas fuerte cada vez que te veo en videollamada",
            " eres la razon por la que creo en el amor verdadero",
            "Nuestros momentos juntos son reales en mi corazon",
            " tu amor me hace sentir completo",
            " nuestros besos seran inolvidables",
            "Eres mi vida , mi amor ",
            "Cada llamada contigo es como una cita bajo las estrellas",
            "te amo mas de lo que las palabras pueden expresar",
            "La distancia es dificil pero nuestro amor siempre gana",
            "Eres mi  razon de ser",
            "Cuando te abrace, por primera vez me senti en paz y en tranquilidad",
            ,
            "hermosa, cada dia te quiero mas",
            " eres mi mayor felicidad",
            "campesina",
            "eres mi vida entera",
            "Cada mensaje tuyo es como un abrazo a mi corazon",
            "Te amare en cualquier lugar, en cualquier universo, en cualquier momento",
            "Eres mi compañera de vida",
            
            "tu amor me da fuerzas para seguir adelante",
            
            "Cada noche de llamada es una bendicion, mi amor",
            " eres la mujer de mis sueños y de mi realidad",
            ,
            "El amor  es dificil, pero contigo todo vale la pena",
            "Eres , mi amor, mi vida entera",
            "Cada segundo que pasa es un segundo mas cerca de ti",
            " preciosa, te amo con toda mi alma",
            ,
            "Eres  perfecta mi amor ",
            "Nuestro amor brilla mas fuerte que cualquier estrella",
            "Mi imillita adorada, eres mi mayor tesoro",
            " tu amor me hace el hombre mas feliz del mundo",
            "Cada dia que pasa te amo mas",
            "Los problemas no importan cuando el amor es tan grande",
            "Eres mi todo, mi mas y mi siempre, mi vida",
            
            " eres la razon de mi felicidad",
            "El amor que siento por ti no tiene limites",
            
            "Cada llamada contigo es un pedacito de cielo",
            "Mi preciosa, eres mi corazon latiendo",
            "La distancia nos hace valorar cada momento juntos",
            ,
            "Te amo hoy, te amare mañana, te amare siempre"
        ];
        
        const loader = new THREE.FontLoader();
        loader.load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_regular.typeface.json', function (font) {
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffb6c1, blending: THREE.AdditiveBlending });
            
            // TITULO PRINCIPAL
            const mainTextGeo = new THREE.TextGeometry('  Wendy Claris Torres  aveces me caes mal Pero te amo', { font: font, size: 12, height: 2 });
            mainTextGeo.center();
            textMesh = new THREE.Mesh(mainTextGeo, textMaterial);
            textMesh.position.set(0, 80, 0);
            scene.add(textMesh);
            
            // FRASE BAJO LA LUNA (MULTILINEA)
            const fraseLineas = [
                "Seamos como la luna: a veces en pedazos",
                "y otras enteras brillando mas que nunca,",
                "pero siempre amandonos en todas las fases."
            ];
            fraseLineas.forEach((linea, i) => {
                const subGeo = new THREE.TextGeometry(linea, { font: font, size: 4.5, height: 0.2 });
                subGeo.center();
                const subMesh = new THREE.Mesh(subGeo, textMaterial.clone());
                subMesh.position.set(0, -55 - (i * 8), 0);
                scene.add(subMesh);
            });
            
            // Emojis (Sprites)
            const emojiCanvas = document.createElement('canvas');
            emojiCanvas.width = 128; emojiCanvas.height = 128;
            const emojiCtx = emojiCanvas.getContext('2d');
            emojiCtx.font = 'bold 100px Arial';
            emojiCtx.textAlign = 'center'; emojiCtx.textBaseline = 'middle';
            
            emojiCtx.clearRect(0,0,128,128); emojiCtx.fillText('🐽',64,64);
            const pigSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(emojiCanvas), transparent: true }));
            pigSprite.scale.set(20,20,1); pigSprite.position.set(-80,80,0); scene.add(pigSprite);
            
            emojiCtx.clearRect(0,0,128,128); emojiCtx.fillText('❤️',64,64);
            const heartSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(emojiCanvas), transparent: true }));
            heartSprite.scale.set(20,20,1); heartSprite.position.set(80,80,0); scene.add(heartSprite);
            
            // Frases aleatorias
            frases.forEach(frase => {
                const phraseGeo = new THREE.TextGeometry(frase, { font: font, size: 7, height: 0.5 });
                phraseGeo.center();
                const phraseMesh = new THREE.Mesh(phraseGeo, textMaterial.clone());
                const spread = 2000;
                phraseMesh.position.set((Math.random()-0.5)*spread, (Math.random()-0.5)*spread, (Math.random()-0.5)*spread);
                phraseMeshes.push(phraseMesh);
                scene.add(phraseMesh);
            });
        });
        
        // 7. ANIMACIÓN
        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.01;
            
            particleMesh.rotation.y += 0.0002;
            
            for(let i=0; i<twinkleCount; i++){
                twinkleMaterial.opacity = 0.5 + Math.sin((time + twinklePhase[i]) * 2) * 0.5;
            }
            
            moonMesh.rotation.y += 0.001;
            moonGlow.rotation.y -= 0.0008;
            const pulse = 1 + Math.sin(time*0.5)*0.05;
            moonGlow.scale.set(pulse, pulse, pulse);

            if(textMesh) textMesh.lookAt(camera.position);
            phraseMeshes.forEach(m => m.lookAt(camera.position));

            comets.forEach((comet, index) => {
                comet.position.x += comet.userData.velocityX;
                comet.position.y += comet.userData.velocityY;
                comet.position.z += comet.userData.velocityZ;
                comet.rotation.z += 0.015;
                comet.userData.lifeTime++;
                if(comet.userData.lifeTime > comet.userData.maxLifeTime) {
                    scene.remove(comet);
                    comets[index] = createComet();
                }
            });

            if(controls) controls.update();
            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
});