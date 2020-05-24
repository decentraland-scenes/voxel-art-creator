import { Manager, materials, colors } from './manager'
import { highlightMaterial, highlightedVoxelID } from './modules/highlighter'

// Global button events
const input = Input.instance

input.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, (): void => {
  log('E Key Pressed')
  Manager.setVoxelColor()
  highlightMaterial.albedoColor = colors[Manager.colorIndex]
  log('Color: ', materials[Manager.colorIndex].albedoColor)
})

input.subscribe('BUTTON_DOWN', ActionButton.SECONDARY, false, (): void => {
  log('F Key Pressed')

  if (highlightedVoxelID != null) {
    engine.removeEntity(engine.entities[highlightedVoxelID])
    Manager.playSubtractVoxelSound()
  }
})
