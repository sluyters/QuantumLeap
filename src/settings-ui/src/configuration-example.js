const test = {
  category: 'item',
  dataType: 'integer',
  domain: {
    type: 'any'
  },
  default: 16,
  current: 8
}

const test2 = {
  category: 'item',
  dataType: 'integer',
  domain: {
    type: 'range',
    low: 2,
    high: null
  },
  default: 16,
  current: 8
}

const test3 = {
  category: 'item',
  dataType: 'integer',
  domain: {
    type: 'list',
    values: [0, 1, 7]
  },
  default: 16,
  current: 8
}

const test4 = {
  category: 'list',
  dataType: 'integer',
  domain: {
    type: 'list',
    values: [0, 1, 7]
  },
  default: [0, 1],
  current: [0, 7]
}

const configuration = {
  settings: [
    {
      type: 'category',
      name: 'general',
      label: 'General',
      settings: [
        {
          type: 'setting',
          name: 'debug',
          label: 'Show debug logs',
          description: 'Display the logs in the terminal for debugging.',
          data: {
            category: 'item',
            dataType: 'boolean',
            domain: null,
            default: false,
            current: true
          }
        },
        {
          type: 'setting',
          name: 'sendContinuousData',
          label: 'Send continuous data',
          description: 'Send the data from each frame to the client.',
          data: {
            category: 'item',
            dataType: 'boolean',
            domain: null,
            default: true,
            current: true
          }
        },
        {
          type: 'category',
          name: 'gesture',
          label: 'Gestures',
          settings: [
            {
              type: 'setting',
              name: 'sendIfRequested',
              label: 'Send if requested',
              description: 'Send recognized gestures only if they are requested by the client.',
              data: {
                category: 'item',
                dataType: 'boolean',
                domain: null,
                default: true,
                current: true
              }
            },
            {
              type: 'setting',
              name: 'loadOnRequest',
              label: 'Load on request',
              description: 'Load gestures based on requests from the client.',
              data: {
                category: 'item',
                dataType: 'boolean',
                domain: null,
                default: false,
                current: false
              }
            }
          ]
        },
        {
          type: 'category',
          name: 'pose',
          label: 'Poses',
          settings: [
            {
              type: 'setting',
              name: 'sendIfRequested',
              label: 'Send if requested',
              description: 'Send recognized gestures only if they are requested by the client.',
              data: {
                category: 'item',
                dataType: 'boolean',
                domain: { type: 'any' },
                default: true,
                current: true
              }
            },
            {
              type: 'setting',
              name: 'loadOnRequest',
              label: 'Load on request',
              description: 'Load gestures based on requests from the client.',
              data: {
                category: 'item',
                dataType: 'boolean',
                domain: { type: 'any' },
                default: false,
                current: false
              }
            }
          ]
        }
      ]
    },
    {
      type: 'category',
      name: 'server',
      label: 'Server',
      settings: [
        {
          type: 'setting',
          name: 'ip',
          label: 'Server IP',
          description: 'IP address of the server (for app interface).',
          data: {
            category: 'item',
            dataType: 'string',
            domain: { type: 'any' },
            default: '127.0.0.1',
            current: '127.0.0.1'
          }
        },
        {
          type: 'setting',
          name: 'port',
          label: 'Server port',
          description: 'Port of the server (for app interface).',
          data: {
            category: 'item',
            dataType: 'integer',
            domain: { 
              type: 'range',
              low: 0,
              high: 65535
            },
            default: 6442,
            current: 6442
          }
        }
      ]
    }
  ],


  settings: {


    selectedModules: {
      sensor: null,
      classifier: null,
      analyzer: null,
      segmenter: null,
      recognizer: null,
      dataset: null
    }
  },
  modules: {
    sensors: null,
    classifiers: null,
    analyzers: null,
    segmenters: null,
    recognizers: null,
    datasets: null
  }
}




const rec = {
  label: 'Jackknife',
  name: 'jackknife-recognizer',
  type: 'recognizer',
  description: 'An all-purpose gesture recognizer that uses template-matching and Dynamic Time Warping (DTW).',
  exportedProperties: {
    points: [],
  },
  settings: [
    {
      type: 'category',
      name: 'cat1',
      label: 'Category 1',
      settings: [

      ]
    },
    {
      type: 'setting',
      name: 'samplingPoints',
      label: 'Number of sampling points',
      description: 'The number of points of the gesture after resampling.',
      data: {
        category: 'item',
        dataType: 'integer',
        domain: {
          type: 'range',
          low: 2,
          high: null
        },
        default: 16,
        current: 8
      }
    },
    {
      type: 'setting',
      label: 'Articulations',
      name: 'articulations',
      description: 'The articulations that are used by the recognizer.',
      data: {
        category: 'list',
        dataType: 'string',
        domain: {
          type: 'list',
          values: {
            isExternalProperty: true,
            module: 'sensor',
            propertyName: 'points'
          }
        },
        default: null,
        current: ['leftPalmPosition']
      }
    },
    // {
    //   label: 'Articulations',
    //   name: 'articulations',
    //   description: 'The articulations that are used by the recognizer.',
    //   data: {
    //     category: 'list',
    //     dataType: 'string',
    //     domain: {
    //       type: 'externalProperty',
    //       module: 'sensor',
    //       propertyName: 'points'
    //     },
    //     default: null,
    //     current: ['leftPalmPosition']
    //   }
    // },
  ],
}