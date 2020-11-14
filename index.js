'use strict'

const OBSWS = require('obs-websocket-js')
const keypress = require('keypress')

const obsConfig = require('./config.js')

let state = 'init'
let tempResources = {}

const obs = new OBSWS()
obs.on('ConnectionOpened', (data) => handleConnect(data))
obs.on('ConnectionClosed', (data) => handleDisconnect(data))
obs.on('AuthenticationSuccess', (data) => handleAuthSuccess(data))
obs.on('AuthenticationFailure', (data) => handleAuthFailure(data))
obs.on('error', (error) => console.error(error))

function handleAuthSuccess(data) {

  console.log('authentication success')

}

function handleAuthFailure(data) {

  console.log('authentication failure')

}

function handleConnect(data) {

  console.log('connected')

}

function handleDisconnect(data) {

  console.log('disconnected')

  state = 'init'

}

keypress(process.stdin)
process.stdin.on('keypress', (ch, key) => {

  //
  // Remote control
  //
  // Escape = Initiate connection
  if (key && key.name == 'escape') {

    if (state === 'init') {

      obs.connect(obsConfig)
        .then(() => {

          state = 'main'

          obs.send('SetCurrentTransition', {'transition-name': 'Fade'})
            .catch(error => console.error(error))

          obs.send('SetTransitionDuration', {duration: 500})
            .catch(error => console.error(error))

        })
        .catch(error => console.error(error))

    }

  }

  //
  // Start Routine (F1, F2, F3, F4)
  //
  // F1 = Start
  if (key && key.name == 'f1') {

    if (state === 'main') {

      state = 'start'
      obs.send('GetCurrentScene')
        .then(data => {

          tempResources['startTo'] = data.name

        })
        .catch(error => console.error(error))

      obs.send('SetCurrentScene', {'scene-name': 'Starting'})
        .catch(error => console.error(error))

      obs.send('SetMute', {source: 'Desktop', mute: true})
        .catch(error => console.error(error))

      obs.send('SetMute', {source: 'Mic', mute: true})
        .catch(error => console.error(error))

      obs.send('SetSceneItemRender', {'scene-name': 'Starting', source: 'Start Timer', render: false})
        .catch(error => console.error(error))

    } else if (state === 'start') {

      obs.send('SetSceneItemRender', {'scene-name': 'Starting', source: 'Start Timer', render: false})
        .catch(error => console.error(error))

    }

  }

  // F2 = Sync
  if (key && key.name == 'f2') {

    if (state === 'start') {

      obs.send('SetSceneItemRender', {'scene-name': 'Starting', source: 'Start Timer', render: true})
        .catch(error => console.error(error))

    }

  }

  // F3 = Abort
  if (key && key.name == 'f3') {

    if (state === 'start') {

      delete tempResources['startTo']
      state = 'main'

    }

  }

  // F4 = Go
  if (key && key.name == 'f4') {

    if (state === 'start') {

      obs.send('SetTransitionDuration', {duration: 2000})
        .catch(error => console.error(error))

      obs.send('SetCurrentScene', {'scene-name': tempResources['startTo'] || 'Blank'})
        .catch(error => console.error(error))

      delete tempResources['startTo']

      obs.send('SetMute', {source: 'Desktop', mute: false})
        .catch(error => console.error(error))

      obs.send('SetMute', {source: 'Mic', mute: false})
        .catch(error => console.error(error))

      obs.send('SetTransitionDuration', {duration: 500})
        .catch(error => console.error(error))

      state = 'main'

    }

  }

  //
  // Break Routine (F5, F7, F8)
  //
  // F5 = Start
  if (key && key.name == 'f5') {

    if (state === 'main') {

      state = 'break'
      obs.send('GetCurrentScene')
        .then(data => {

          tempResources['breakTo'] = data.name

        })
        .catch(error => console.error(error))

      obs.send('SetCurrentScene', {'scene-name': 'BRB'})
        .catch(error => console.error(error))

      obs.send('SetMute', {source: 'Desktop', mute: true})
        .catch(error => console.error(error))

      obs.send('SetMute', {source: 'Mic', mute: true})
        .catch(error => console.error(error))

    }

  }

  // F7 = Abort
  if (key && key.name == 'f7') {

    if (state === 'break') {

      delete tempResources['breakTo']
      state = 'main'

    }

  }

  // F8 = End
  if (key && key.name == 'f8') {

    if (state === 'break') {

      obs.send('SetCurrentScene', {'scene-name': tempResources['breakTo'] || 'Blank'})
        .catch(error => console.error(error))

      delete tempResources['breakTo']

      obs.send('SetMute', {source: 'Desktop', mute: false})
        .catch(error => console.error(error))

      obs.send('SetMute', {source: 'Mic', mute: false})
        .catch(error => console.error(error))

    }

  }

  //
  // End Routine (F9, F11)
  //
  // F9 = Start
  if (key && key.name == 'f9') {

    if (state === 'main') {

      state = 'end'

      obs.send('SetCurrentScene', {'scene-name': 'Ending'})
        .catch(error => console.error(error))

      obs.send('SetMute', {source: 'Desktop', mute: true})
        .catch(error => console.error(error))

      obs.send('SetMute', {source: 'Mic', mute: true})
        .catch(error => console.error(error))

    }

  }

  // F10/F11 = Abort
  if (key && (key.name == 'f11' || key.name == 'f10')) {

    if (state === 'end') {

      state = 'main'

    }

  }

  //
  // Scenes (Q, W, E, A, S, D, F, Z, X, C)
  //
  // Q = Starting
  if (key && key.name == 'q') {

    if (state === 'main') {

      obs.send('SetCurrentScene', {'scene-name': 'Starting'})
        .catch(error => console.error(error))

    }

  }

  // W = BRB
  if (key && key.name == 'w') {

    if (state === 'main') {

      obs.send('SetCurrentScene', {'scene-name': 'BRB'})
        .catch(error => console.error(error))

    }

  }

  // E = Ending
  if (key && key.name == 'e') {

    if (state === 'main') {

      obs.send('SetCurrentScene', {'scene-name': 'Ending'})
        .catch(error => console.error(error))

    }

  }

  // A = Screen (Monitor 1)
  if (key && key.name == 'a') {

    if (state === 'main') {

      obs.send('SetCurrentScene', {'scene-name': 'Screen (Monitor 1)'})
        .catch(error => console.error(error))

    }

  }

  // S = Screen (Monitor 2)
  if (key && key.name == 's') {

    if (state === 'main') {

      obs.send('SetCurrentScene', {'scene-name': 'Screen (Monitor 2)'})
        .catch(error => console.error(error))

    }

  }

  // D = Chatting
  if (key && key.name == 'd') {

    if (state === 'main') {

      obs.send('SetCurrentScene', {'scene-name': 'Chatting'})
        .catch(error => console.error(error))

    }

  }

  // F = Screen (Window Generic)
  if (key && key.name == 'f') {

    if (state === 'main') {

      obs.send('SetCurrentScene', {'scene-name': 'Screen (Window Generic)'})
        .catch(error => console.error(error))

    }

  }

  // Z = Game (League of Legends Client)
  if (key && key.name == 'z') {

    if (state === 'main') {

      obs.send('SetCurrentScene', {'scene-name': 'Game (League of Legends Client)'})
        .catch(error => console.error(error))

    }

  }

  // X = Game (League of Legends)
  if (key && key.name == 'x') {

    if (state === 'main') {

      obs.send('SetCurrentScene', {'scene-name': 'Game (League of Legends)'})
        .catch(error => console.error(error))

    }

  }

  // C = Game (Fullscreen Generic)
  if (key && key.name == 'c') {

    if (state === 'main') {

      obs.send('SetCurrentScene', {'scene-name': 'Game (Fullscreen Generic)'})
        .catch(error => console.error(error))

    }

  }

  //
  // Sources (U, I, O, P, J, K, L, ;)
  //
  // U = Mute all audio sources
  if (key && key.name == 'u') {

    if (state !== 'init') {

      obs.send('SetMute', {source: 'Desktop', mute: true})
        .catch(error => console.error(error))

      obs.send('SetMute', {source: 'Mic', mute: true})
        .catch(error => console.error(error))

    }

  }

  // I = Mute desktop audio source
  if (key && key.name == 'i') {

    if (state !== 'init') {

      obs.send('SetMute', {source: 'Desktop', mute: true})
        .catch(error => console.error(error))

    }

  }

  // O = Mute mic audio source
  if (key && key.name == 'o') {

    if (state !== 'init') {

      obs.send('SetMute', {source: 'Mic', mute: true})
        .catch(error => console.error(error))

    }

  }

  // P = Hide webcam source
  if (key && key.name == 'p') {

    if (state !== 'init') {

      obs.send('SetSourceFilterVisibility', {sourceName: 'Webcam', filterName: 'Hide', filterEnabled: true})
        .catch(error => console.error(error))

    }

  }

  // J = Unmute all audio sources
  if (key && key.name == 'j') {

    if (state !== 'init') {

      obs.send('SetMute', {source: 'Desktop', mute: false})
        .catch(error => console.error(error))

      obs.send('SetMute', {source: 'Mic', mute: false})
        .catch(error => console.error(error))

    }

  }

  // K = Unmute desktop audio source
  if (key && key.name == 'k') {

    if (state !== 'init') {

      obs.send('SetMute', {source: 'Desktop', mute: false})
        .catch(error => console.error(error))

    }

  }

  // L = Mute mic audio source
  if (key && key.name == 'l') {

    if (state !== 'init') {

      obs.send('SetMute', {source: 'Mic', mute: false})
        .catch(error => console.error(error))

    }

  }

  // ; = Hide webcam source
  if (!key && ch == ';') {

    if (state !== 'init') {

      obs.send('SetSourceFilterVisibility', {sourceName: 'Webcam', filterName: 'Hide', filterEnabled: false})
        .catch(error => console.error(error))

    }

  }

  //
  // Remote control
  //
  // Ctrl+C = Stop capturing keys
  if (key && key.ctrl && key.name == 'c') {

    process.stdin.pause()
    process.stdin.setRawMode(false)

  }

})

process.stdin.setRawMode(true)
process.stdin.resume()