function setupArgs() {
  const argv = process.argv.slice(2)[0].split(" ")

  var args = {}

  argv.forEach(elem => {
    var split = elem.split("=")
    args[split[0]] = split[1]
  })

  return args
}

export const args = setupArgs()
export const DEBUG = args['debug']