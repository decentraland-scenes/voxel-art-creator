export default {
  sounds: {
    addVoxel: new AudioClip('sounds/addVoxel.mp3'),
    subtractVoxel: new AudioClip('sounds/subtractVoxel.mp3'),
  },
  models: {
    baseGrid: new GLTFShape('models/baseGrid.glb'),
  },
  icons: {
    add: new Texture('images/addIcon.png'),
    subtract: new Texture('images/subtractIcon.png'),
    eyeDropper: new Texture('images/eyeDropperIcon.png'),
    help: new Texture('images/helpIcon.png'),
  },
}
