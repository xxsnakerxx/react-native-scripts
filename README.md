# react-native-scripts
Helpful scripts for React Native projects

![npm (scoped)](https://img.shields.io/npm/v/@xxsnakerxx/react-native-scripts.svg)&nbsp;&nbsp;![npm](https://img.shields.io/npm/dt/@xxsnakerxx/react-native-scripts.svg)&nbsp;&nbsp;![NpmLicense](https://img.shields.io/npm/l/@xxsnakerxx/react-native-scripts.svg)

## Installation
```bash
yarn add --dev @xxsnakerxx/react-native-scripts
```

## rns-build-android
```bash
Usage: yarn rns-build-android [options]

Options:
  -t, --type       gradle buildType  [string] [required]
  -s, --sourcemap  build sourcemap  [boolean] [default: true]
  --apkName        apk file name  [string] [default: package name]
  --apkSuffix      apk file suffix  [string] [default: package version]
  --version        Show version number  [boolean]
  --help           Show help  [boolean]
```

## rns-build-ios
```bash
Usage: yarn rns-build-ios [options]

Options:
  --teamId             [string] [required]
  --scheme             [string] [required]
  -c, --configuration  [string] [required]
  -u, --upload         upload to app store  [string]
  --altoolUser         apple ID, required for uploading  [string]
  --altoolPass         app specific password (appleid.apple.com -> Security -> Generate Password), required for uploading  [string]
  --icloudEnv          value for iCloudContainerEnvironment key  [string] [default: "Production"]
  -s, --sourcemap      build sourcemap  [boolean] [default: true]
  --ipaName            ipa file name  [string] [default: package name]
  --ipaSuffix          ipa file suffix  [string] [default: package version]
  --version            Show version number  [boolean]
  --help               Show help  [boolean]
```

## rns-codepush
```bash
Usage: yarn rns-codepush [options] [code-push cli options]
       run "code-push release-react --help" to see other available code-push options

Options:
  --app            app name  [string] [required]
  -e, --env  [string] [required]
  -p, --platform  [string] [choices: "ios", "android", ""] [default: both]
  -s, --sourcemap  build sourcemap  [boolean] [default: true]
  --version        Show version number  [boolean]
  --help           Show help  [boolean]
```

## rns-build-sourcemap
```bash
Usage: yarn rns-build-sourcemap [options]

Options:
  -f, --folder  [string] [default: "sourcemaps"]
  -p, --platform  [string] [required] [choices: "ios", "android"]
  -e, --env  [string] [required]
  --version       Show version number  [boolean]
  --help          Show help  [boolean]
```

## find-source
```bash
Usage: yarn rns-find-source [options]

Options:
  -p, --path  path to sourcemap  [string] [required]
  -l, --line  [string] [default: "0:0"]
  --version   Show version number  [boolean]
  --help      Show help  [boolean]
```

## link-assets
```bash
Usage: yarn rns-link-assets [options]

Options:
  --version  Show version number  [boolean]
  --help     Show help  [boolean]
```

### PRs are welcome
