import { expect } from 'chai'
import bulletCollisionLayer from './collisionLayerData'
import mapData from '../../public/assets/map/resourcePals.json'


let mapDataCollision = mapData.layers.find(layer => layer.name === 'collision').data
let dataMatches = true

describe('map asset collision layer', () => {
  it('should only have one layer called "collision"', () => {
    const numCollisionLayers = mapData.layers.filter(layer => layer.name === 'collision').length
    expect(numCollisionLayers).to.be.equal(1)
  })
})

describe('server bullet collision layer', () => {
  it('should exist as an array', () => {
    expect(bulletCollisionLayer).to.be.an('array')
  });
  it('should be the same length as the map assets collision layer', () => {
    expect(bulletCollisionLayer.length).to.equal(mapDataCollision.length)
  })
  it('should have the same data as the map assets collision layer', () => {
    const  isEqual = (first, second) => {
      return first === second
    }
    for (let i = 0; i < mapDataCollision.length; i++) {
      if (!isEqual(mapDataCollision[i], bulletCollisionLayer[i])) {
        dataMatches = false
      }
    }
    expect(dataMatches).to.be.equal(true)
  })
})
