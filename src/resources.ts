export default {
  sounds: {
    add: new AudioClip('sounds/addVoxel.mp3'),
    subtract: new AudioClip('sounds/subtractVoxel.mp3'),
    eyeDrop: new AudioClip('sounds/eyeDropVoxel.mp3')
  },
  models: {
    baseGrid: new GLTFShape('models/baseGrid.glb'),
  },
  icons: {
    add: new Texture('images/addIcon.png'),
    subtract: new Texture('images/subtractIcon.png'),
    eyeDrop: new Texture('images/eyeDropIcon.png'),
  },
}
