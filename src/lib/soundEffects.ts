import { Howl } from 'howler';
import tilePop from '../../assets/sounds/tile-pop.wav';
import successChime from '../../assets/sounds/success-chime.wav';

const sounds = {
  tilePop: new Howl({
    src: [tilePop],
    volume: 0.35,
    preload: true,
    rate: 1.05,
  }),
  successChime: new Howl({
    src: [successChime],
    volume: 0.45,
    preload: true,
  }),
};

export type SoundEffect = keyof typeof sounds;

export const playSound = (effect: SoundEffect) => {
  const sound = sounds[effect];
  if (!sound) {
    return;
  }
  sound.play();
};

export const preloadSounds = () => {
  Object.values(sounds).forEach((sound) => {
    if (sound.state() === 'unloaded') {
      sound.load();
    }
  });
};
