require('dotenv').config()
const puppeteer = require('puppeteer')
const Mustache = require('mustache')
const fetch = require('node-fetch')
const fs = require('fs')

const view = {
  update_time: encodeURI(getTime()),
}

function getTime(time = Date.now()) {
  return new Date(time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'America/Toronto',
  })
}

async function getWeatherInfo() {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=toronto&appid=${process.env.OPEN_WEATHER_KEY}&units=metric`
  )
  const data = await response.json()
  view.city_temp = Math.round(data.main.temp)
  view.city_temp_feel = Math.round(data.main.feels_like)
  view.city_weather = data.weather[0].description
  view.city_weather_icon = data.weather[0].icon
  view.city_sunrise = getTime(data.sys.sunrise * 1000)
  view.city_sunset = getTime(data.sys.sunset * 1000)
}

async function getInstagramPosts() {
  try {
    const account = 'canada'
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(`https://picuki.com/profile/${account}`)
    const pics = await page.evaluate(() => {
      const images = document.querySelectorAll('.post-image')
      return [].map.call(images, (img) => img.src)
    })
    const instagram = pics.slice(0, 3)
    view.image_1 = instagram[0] || 'https://instagram.fykz1-2.fna.fbcdn.net/v/t51.2885-15/e35/p1080x1080/123137442_137859231418492_609286326963134671_n.jpg?_nc_ht=instagram.fykz1-2.fna.fbcdn.net&_nc_cat=104&_nc_ohc=Q738AR9D9FsAX-0_mdr&tp=19&oh=add30e12d7220584ddf7ee24736e77f5&oe=5FDE4185'
    view.image_2 = instagram[1] || 'https://instagram.fykz1-2.fna.fbcdn.net/v/t51.2885-15/e35/119217007_974219173047369_6018818873875886538_n.jpg?_nc_ht=instagram.fykz1-2.fna.fbcdn.net&_nc_cat=109&_nc_ohc=WsSCBGDGmu4AX9GjCDd&tp=18&oh=547ad25a43f70acff6d8a9a50dcf68d2&oe=5FDEB256'
    view.image_3 = instagram[2] || 'https://instagram.fykz1-1.fna.fbcdn.net/v/t51.2885-15/e35/p1080x1080/67593102_459077354798009_3732586812368978546_n.jpg?_nc_ht=instagram.fykz1-1.fna.fbcdn.net&_nc_cat=105&_nc_ohc=Ph84k9pfEvkAX_MipiH&tp=19&oh=6c197d190a69ab4a2a73dd46fc5b5910&oe=5FDE06B4'
    await browser.close()
  } catch (error) {
    console.log('Error', error)
  }
}

async function generateReadMe() {
  fs.readFile('./main.mustache', (error, data) => {
    if (error) throw error
    const output = Mustache.render(data.toString(), view)
    fs.writeFileSync('./README.md', output)
  })
}

async function action() {
  await getWeatherInfo()
  await getInstagramPosts()
  await generateReadMe()
}

action()
