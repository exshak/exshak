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
    view.image_1 = instagram[0]
    view.image_2 = instagram[1]
    view.image_3 = instagram[2]
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
