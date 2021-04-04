
module.exports = function itemfinder(d) {
  d.game.initialize('inventory');
  let updateThrottle = false,
    updateTimeout

  d.game.on('enter_game', () => { if (d.settings.itemlist[d.game.me.serverId] == undefined) { d.settings.itemlist[d.game.me.serverId] = {} } })

  d.game.inventory.on('update', () => {
    if (updateThrottle || d.game.me.inCombat) return;
    d.clearTimeout(updateTimeout)
    updateTimeout = d.setTimeout(() => { updateThrottle = false }, 1000)
    updateThrottle = true
    itemsave(d.game.inventory.bagOrPocketItems, d.game.me.name)
  })

  d.hook('S_VIEW_WARE_EX', 3, (e) => {
    var page = e.offset / 72 + 1
    if (e.container == 1) { itemsave(e.items, `Bank Page(${page})`) }
    if (e.container == 9) { itemsave(e.items, `${d.game.me.name}'s Pet Page(${page})`) }
    if (e.container == 12) { itemsave(e.items, `Wardrobe`) }
  })

  function itemsave(obj, location) {
    for (const [key, value] of Object.entries(d.settings.itemlist[d.game.me.serverId])) {
      if (value.location == location) delete d.settings.itemlist[d.game.me.serverId][key]
    }
    setTimeout(() => {
      obj.forEach(item => {
        d.settings.itemlist[d.game.me.serverId][item.dbid] = { name: d.game.data.items.get(item.id).name, location: location, amount: item.amount }
      })
    }, 50)

  }

  d.command.add('itemsearch', (arg) => {
    if (arg == 'debug') {
      d.command.message(updateThrottle)
    }
    if (!arg) { d.settings.scanning = !d.settings.scanning; d.command.message(`Item Scanning ${d.settings.scanning ? 'En' : 'dis'}abled`) }
    if (arg && arg !== 'debug') {
      d.command.message(`Attempting to find an item with <font color="#77DD77">${arg}</font> in its name`)
      for (const [key, value] of Object.entries(d.settings.itemlist[d.game.me.serverId])) {
        if (value.name.toLowerCase().includes(arg.toLowerCase())) {
          d.command.message(`found <font color="#77DD77">${value.name}</font>x${value.amount} on <font color="#DD7777">${value.location}</font>`)
        }
      }
    }

  })
}
