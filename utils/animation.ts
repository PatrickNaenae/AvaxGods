/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */


// Utility: play audio from a clip
export const playAudio = (clip: string): Promise<void> => {
  const audio = new Audio();
  audio.src = clip;
  return audio.play();
};

// Cross-browser animation end support
const prefixes = ['webkit', 'moz', 'ms', ''];

function prefixedEvent(
    element: HTMLElement,
    type: string,
    callback: (ev: Event) => void,
): void {
  for (let p = 0; p < prefixes.length; p++) {
    const prefixedType = prefixes[p] ? prefixes[p] + type : type.toLowerCase();
    element.addEventListener(prefixedType, callback, false);
  }
}

// CSS transform utility
function transform(
    $e: HTMLElement,
    xValue = 0,
    yValue = 0,
    scaleValue = 1,
    rotationValue = 0,
    percent = false,
): void {
  const unit = percent ? '%' : 'px';

  $e.style.transform = `translate(${xValue}${unit}, ${yValue}${unit}) scale(${scaleValue}) rotate(${rotationValue}deg)`;
}


// Create a particle element
function createParticle(x: number, y: number, scale: number): HTMLDivElement {
  const $particle = document.createElement('div');
  const $sparcle = document.createElement('div');

  $particle.className = 'particle';
  $sparcle.className = 'sparcle';

  transform($particle, x, y, scale);
  $particle.appendChild($sparcle);

  return $particle;
}

// Attach particles to a container
function explode($container: HTMLDivElement): void {
  const particles: HTMLDivElement[] = [
    createParticle(0, 0, 1),
    createParticle(50, -15, 0.4),
    createParticle(50, -105, 0.2),
    createParticle(-10, -60, 0.8),
    createParticle(-10, 60, 0.4),
    createParticle(-50, -60, 0.2),
    createParticle(-50, -15, 0.75),
    createParticle(-100, -15, 0.4),
    createParticle(-100, -15, 0.2),
    createParticle(-100, -115, 0.2),
    createParticle(80, -15, 0.1),
  ];

  particles.forEach((particle) => {
    $container.appendChild(particle);
    prefixedEvent(particle, 'AnimationEnd', function (this: HTMLElement) {
      const self = this;
      setTimeout(() => {
        requestAnimationFrame(() => {
          if ($container.contains(self)) {
            $container.removeChild(self);
          }
        });
      }, 100);
    });
  });

  // Remove old containers (optional)
  document.querySelectorAll('.container').forEach((el) => el.remove());
}

// Create and transform container with particles
function explodeGroup(
    x: number,
    y: number,
    trans: { x: number; y: number; scale: number; r: number },
): HTMLDivElement {
  const $container = document.createElement('div');
  $container.className = 'container';
  $container.style.position = 'absolute';
  $container.style.top = `${y}px`;
  $container.style.left = `${x}px`;

  transform($container, trans.x, trans.y, trans.scale, trans.r, true);
  explode($container);

  return $container;
}

type SparkleCoords = { pageX: number; pageY: number };

// Overload signatures
export function sparcle(event: MouseEvent): void;
export function sparcle(coords: SparkleCoords): void;

// Main trigger function on interaction
export function sparcle(arg: MouseEvent | SparkleCoords): void {
  const pageX = arg.pageX;
  const pageY = arg.pageY;

  const explosions: HTMLDivElement[] = [];

  explosions.push(explodeGroup(pageX, pageY, { scale: 1, x: -50, y: -50, r: 0 }));
  explosions.push(explodeGroup(pageX, pageY, { scale: 0.5, x: -30, y: -50, r: 180 }));
  explosions.push(explodeGroup(pageX, pageY, { scale: 0.5, x: -50, y: -20, r: -90 }));

  requestAnimationFrame(() => {
    playAudio("/assets/sounds/explosion.mp3");
    explosions.forEach((boum, i) => {
      setTimeout(() => {
        document.body.appendChild(boum);
      }, i * 100);
    });
  });
}
