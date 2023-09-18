// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const weather = require('./weather');
const AutoUpdate = vscode.workspace.getConfiguration().get('weather.autoUpdate')
const ShowLifeIndex = vscode.workspace.getConfiguration().get('weather.showLifeIndex')
const barPosition = vscode.workspace.getConfiguration().get('weather.position') == "left" ? vscode.StatusBarAlignment.Left : vscode.StatusBarAlignment.Right
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
let bar, barNext, barLife;
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand('extension.weather', async function (position = barPosition) {
    let locationId = context.globalState.get('locationId')
    let location = context.globalState.get('location')
    if (!locationId || !location) {
      location = await vscode.window.showInputBox({ placeHolder: '输入城市名( 中国/全球 )' })
      locationId = await pickLocation(location)
    }
    if (locationId) {
      const now = await getNowWeather(locationId)
      bar ? bar.dispose() : ''
      bar = vscode.window.createStatusBarItem(position)
      bar.text = location.split('-')[0] + ' ' + now.text + ' ' + now.temp + '℃'
      bar.tooltip = '当前实况'
      bar.command = 'extension.replacecity'
      bar.show()

      const nextDay = await getForecast(locationId)
      barNext ? barNext.dispose() : ''
      barNext = vscode.window.createStatusBarItem(position)
      barNext.text = `${nextDay.tempMin}℃~${nextDay.tempMax}℃ ${nextDay.textDay}/${nextDay.textNight}`
      barNext.tooltip = `明日预报: 最低温度${nextDay.tempMin}℃ 最高温度${nextDay.tempMax}℃ 白天${nextDay.textDay}, 晚上${nextDay.textNight}`
      barNext.show()

      if (ShowLifeIndex) {
        const lifeIndex = await getLifeIndex(locationId)
        barLife ? barLife.dispose() : ''
        barLife = vscode.window.createStatusBarItem(position)
        barLife.text = `生活指数:${lifeIndex.category}`
        barLife.tooltip = `生活指数等级: ${lifeIndex.level} ${lifeIndex.text || ''}`
        barLife.command = {
          title: 'open',
          command: 'vscode.open',
          arguments: [vscode.Uri.parse(lifeIndex.fxLink)]
        }
        barLife.show()
      }

      context.globalState.update('locationId', locationId)
      context.globalState.update('location', location.split('-')[0])
    }
  })

  // 更换城市
  let replacecity = vscode.commands.registerCommand('extension.replacecity', async function () {
    const location = await vscode.window.showInputBox({ placeHolder: '输入城市名( 中国/全球 )' })
    const locationId = await pickLocation(location)
    if (location && locationId) {
      context.globalState.update('locationId', locationId)
      context.globalState.update('location', location.split('-')[0])
      vscode.commands.executeCommand('extension.weather')
    }
  })

  /**
   * 添加城市
   * @param {number} 位置 left=1 right=2
   */
  let addCity = vscode.commands.registerCommand('extension.addCity', async function (position = 2) {
    const location = await vscode.window.showInputBox({ placeHolder: '输入城市名( 中国/全球 )' })
    const locationId = await pickLocation(location);
    if (location && locationId) {
      context.globalState.update('locationIdRight', locationId)
      context.globalState.update('locationRight', location.split('-')[0])
      vscode.commands.executeCommand('extension.weather', position)
    }
  });

  vscode.commands.executeCommand('extension.weather')

  if (AutoUpdate) {
    setInterval(function () {
      vscode.commands.executeCommand('extension.weather')
    }, 1000 * 60 * 60 * 2)
  }

  context.subscriptions.push(replacecity, disposable, addCity)
}

function getNowWeather(locationId) {
  return new Promise(async (resolve) => {
    const now = await weather.nowWeather(locationId)
    if (now.data.code === '200') {
      const res = now.data.now
      resolve({
        temp: res.temp,
        text: res.text
      })
    } else {
      netError()
    }
  })
}

function getForecast(locationId) {
  return new Promise(async (resolve) => {
    const now = await weather.forecast(locationId)
    if (now.data.code === '200') {
      const res = now.data.daily[0]
      resolve({
        tempMax: res.tempMax,
        tempMin: res.tempMin,
        textDay: res.textDay,
        textNight: res.textNight
      })
    } else {
      netError()
    }
  })
}


function getLifeIndex(locationId) {
  return new Promise(async (resolve) => {
    const index = await weather.getIndices(locationId)
    if (index.data.code === '200') {
      const res = index.data.daily[0]
      resolve({
        desc: res.text,
        category: res.category,
        level: res.level,
        fxLink: index.data.fxLink
      })
    } else {
      netError()
    }
  })
}

function pickLocation(location) {
  return new Promise(async (resolve) => {
    const result = await weather.getLocation(location);
    if (result.data.code === '200') {
      const detailLocation = await vscode.window.showQuickPick(result.data.location.map(v => v.name + '-' + v.id), {
        placeHolder: '选择一个地区',
      });
      if (detailLocation) {
        const locationId = detailLocation.split('-')[1]
        resolve(locationId)
      }
    } else {
      netError()
    }
  })
}

function netError() {
  vscode.window.showErrorMessage('Weather: 请求错误');
}

exports.activate = activate

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
