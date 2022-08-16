function setupArgs() {
  const argv = process.argv.slice(2)[0].split(" ")

  var args = {}

  argv.forEach(elem => {
    var split = elem.split("=")
    args[split[0]] = split[1]
  })

  return args
}

const args = setupArgs()
export const API_PORT = args['backend-port'] ? parseInt(args['backend-port']) : 3000
export const DEBUG = args['debug'] ? args['debug'] === "true" : false