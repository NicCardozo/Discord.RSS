const log = require('../../util/logger.js')
const dbOpsGuilds = require('../../util/db/guilds.js')
const dbOpsFailedLinks = require('../../util/db/failedLinks.js')

exports.normal = async (bot, message) => {
  try {
    const link = message.content.split(' ')[1]
    if (!link) return await message.channel.send('No link detected.')
    const guildRssList = await dbOpsGuilds.getAll()
    const affected = {}

    guildRssList.forEach(guildRss => {
      const rssList = guildRss.sources
      if (!rssList) return
      for (var rssName in rssList) {
        const source = rssList[rssName]
        if (source.link !== link) continue
        if (!affected[guildRss.id]) affected[guildRss.id] = { guildRss: guildRss, rssNames: [rssName] }
        else affected[guildRss.id].rssNames.push(rssName)
      }
    })

    const failedLinkStatus = await dbOpsFailedLinks.get(link)
    if (failedLinkStatus && failedLinkStatus.failed) return await message.channel.send(`That link has already failed on ${failedLinkStatus.failed}.`)
    if (Object.keys(affected).length === 0) return await message.channel.send('No guilds found with that link.')
    await dbOpsFailedLinks.fail(link)
    await message.channel.send('Successfully failed a link.')
  } catch (err) {
    log.owner.warning('forceremove', message.guild, message.author, err)
  }
}

exports.sharded = exports.normal
