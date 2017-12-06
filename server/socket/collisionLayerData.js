const mapData = require('../../public/assets/map/resourcePals.json')

const bulletCollisionLayer = mapData.layers.find(element => element.name === 'collision').data

module.exports = bulletCollisionLayer
