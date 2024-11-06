import { React, useState } from 'react'
import { makeStyles, useTheme } from '@mui/styles';

const styles = (theme) => ({
  csvModule: {
    cursor: 'pointer',
  },
  csvText: {
    pointerEvents: 'none',
  },
});

const useStyles = makeStyles(styles);

function PipelineDiagram(props) {
  const { onClick } = props;
  const theme = useTheme();
  // Colors
  const backgroundColor = '#b3b3b3';
  const dataStreamColor = '#ccc';
  const hoveredModuleColor = theme.palette.primary.main;
  const moduleColor = '#666';
  const moduleTextColor = '#fff'
  const extModuleColor = '#333';
  const extModuleTextColor = '#fff'
  // State (for hover)
  const [ state, setState ] = useState({
    'sensors': false,
    'filters': false,
    'analyzers': false,
    'segmenters': false,
    'static-recognizers': false,
    'dynamic-recognizers': false,
    'static-datasets': false,
    'dynamic-datasets': false,
    'api': false,
  });
  const classes = useStyles();
  const setHover = (name) => {
    setState({
      [name]: true
    });
  }
  const removeHover = (name) => {
    setState({
      [name]: false
    });
  }
  return (
    <svg
      viewBox="0 0 2571.40148 1664.31498"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fillRule="evenodd">
        <path d="M189.03.08v1663h2192V.08h-2192z" fill="#e7e6e6" />
        <path d="M189.03 491.41v1133.7h376.14V491.41H189.03z" fill={backgroundColor} />
        <path d="M189.03 529.17v377.9H453.5v-377.9H189.03z" 
          className={classes.csvModule}
          onClick={() => onClick('static-datasets')}
          onMouseEnter={() => setHover('static-datasets')}
          onMouseLeave={() => removeHover('static-datasets')}
          fill={state['static-datasets'] ? hoveredModuleColor : moduleColor} 
        />
      </g>
      <g fontFamily="Calibri" fontSize={48} letterSpacing={0} wordSpacing={0}>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(267.61 676.8)"
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"Static"}
            </tspan>
          </tspan>
        </text>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(249.05 734.39)"
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"dataset"}
            </tspan>
          </tspan>
        </text>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(234.81 791.99)"
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"loader(s)"}
            </tspan>
          </tspan>
        </text>
      </g>
      <path
        className={classes.csvModule}
        onClick={() => onClick('sensors')}
        onMouseEnter={() => setHover('sensors')}
        onMouseLeave={() => removeHover('sensors')}
        fill={state['sensors'] ? hoveredModuleColor : moduleColor}
        d="M189.03 75.756v378.06H453.5V75.756H189.03z"
      />
      <text
        className={classes.csvText}
        fill={moduleTextColor}
        transform="translate(255.29 252.24)"
        fontFamily="Calibri"
        fontSize={48}
        letterSpacing={0}
        wordSpacing={0}
        style={{
          lineHeight: "125%",
        }}
      >
        <tspan x={0} y={0}>
          <tspan dx={0} dy={0} fill="#FFF">
            {"Sensor"}
          </tspan>
        </tspan>
      </text>
      <text
        className={classes.csvText}
        fill={moduleTextColor}
        transform="translate(210.97 309.83)"
        fontFamily="Calibri"
        fontSize={48}
        letterSpacing={0}
        wordSpacing={0}
        style={{
          lineHeight: "125%",
        }}
      >
        <tspan x={0} y={0}>
          <tspan dx={0} dy={0} fill="#FFF">
            {"interface(s)"}
          </tspan>
        </tspan>
      </text>
      <path
        d="M.08 75.756v378.06h188.95V75.756H.08z"
        fill="#262626"
        fillRule="evenodd"
      />
      <text
        className={classes.csvText}
        fill={moduleTextColor}
        transform="rotate(-90 232.825 121.975)"
        fontFamily="Calibri"
        fontSize={48}
        letterSpacing={0}
        wordSpacing={0}
        style={{
          lineHeight: "125%",
        }}
      >
        <tspan x={0} y={0}>
          <tspan dx={0} dy={0} fill="#FFF">
            {"Sensor"}
          </tspan>
        </tspan>
      </text>
      <text
        className={classes.csvText}
        fill={moduleTextColor}
        transform="rotate(-90 166.83 55.98)"
        fontFamily="Calibri"
        fontSize={48}
        letterSpacing={0}
        wordSpacing={0}
        style={{
          lineHeight: "125%",
        }}
      >
        <tspan x={0} y={0}>
          <tspan dx={0} dy={0} fill="#FFF">
            {"(s)"}
          </tspan>
        </tspan>
      </text>
      <path
        d="M.08 529.17v377.9h188.95v-377.9H.08z"
        fill="#262626"
        fillRule="evenodd"
      />
      <g fontFamily="Calibri" fontSize={48} letterSpacing={0} wordSpacing={0}>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="rotate(-90 492.115 381.315)"
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"Static"}
            </tspan>
          </tspan>
        </text>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="rotate(-90 433.08 322.28)"
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"dataset"}
            </tspan>
          </tspan>
        </text>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="rotate(-90 360.845 250.045)"
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"(s)"}
            </tspan>
          </tspan>
        </text>
      </g>
      <path
        d="M189.03 1209.5v377.9H453.5v-377.9H189.03z"
        className={classes.csvModule}
        onClick={() => onClick('dynamic-datasets')}
        onMouseEnter={() => setHover('dynamic-datasets')}
        onMouseLeave={() => removeHover('dynamic-datasets')}
        fill={state['dynamic-datasets'] ? hoveredModuleColor : moduleColor}
      />
      <g fontFamily="Calibri" fontSize={48} letterSpacing={0} wordSpacing={0}>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(236.55 1357.1)"
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"Dynamic"}
            </tspan>
          </tspan>
        </text>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(249.02 1414.7)"
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"dataset"}
            </tspan>
          </tspan>
        </text>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(234.79 1472.3)"
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"loader(s)"}
            </tspan>
          </tspan>
        </text>
      </g>
      <path
        d="M.08 1209.5v377.9h188.95v-377.9H.08z"
        fill="#262626"
        fillRule="evenodd"
      />
      <g fontFamily="Calibri" fontSize={48} letterSpacing={0} wordSpacing={0}>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="rotate(-90 782.652 700.648)"
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"Dynamic"}
            </tspan>
          </tspan>
        </text>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="rotate(-90 821.85 682.25)"
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"datasets"}
            </tspan>
          </tspan>
        </text>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="rotate(-90 740.25 600.65)"
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"(s)"}
            </tspan>
          </tspan>
        </text>
      </g>
      <g>
        <path
          d="M529.17 37.838v1587.3h1247.3V37.838H529.17z"
          fill={backgroundColor}
          fillRule="evenodd"
        />
        <text
          transform="translate(955.4 88.03)"
          fontFamily="Calibri"
          fontSize={48}
          letterSpacing={0}
          wordSpacing={0}
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0}>
              {"Frame processor"}
            </tspan>
          </tspan>
        </text>
        <g fillRule="evenodd">
          <path
            d="M453.66 242.15v45.278h151.19V242.15H453.66zM453.66 695.4v45.438h491.33V695.4H453.66z"
            fill={dataStreamColor}
          />
          <path
            d="M685.96 702.28l26.719 15.839-26.719 15.839zM515.89 249.03l26.719 15.839-26.719 15.839z"
            fill="#fff"
          />
        </g>
      </g>
      <g fill={dataStreamColor} fillRule="evenodd">
        <path d="M453.66 1375.7v45.438h1118.7V1375.7H453.66z" />
        <path d="M1118.7 1321.9v71.196h-45.278V1321.9zM1572.3 1321.9v71.196h-45.278V1321.9z" />
      </g>
      <g>
        <g fillRule="evenodd">
          <path
            d="M1080.3 1360.6l15.839-26.719 15.839 26.719zM1533.8 1360.6l15.839-26.719 15.839 26.719z"
            fill="#fff"
          />
          <path
            d="M944.99 566.93v302.38h302.38V566.93H944.99z"
            className={classes.csvModule}
            onClick={() => onClick('static-recognizers')}
            onMouseEnter={() => setHover('static-recognizers')}
            onMouseLeave={() => removeHover('static-recognizers')}
            fill={state['static-recognizers'] ? hoveredModuleColor : moduleColor}
          />
        </g>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(1042.6 705.59)"
          fontFamily="Calibri"
          fontSize={48}
          letterSpacing={0}
          wordSpacing={0}
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"Static"}
            </tspan>
          </tspan>
        </text>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(994.88 763.19)"
          fontFamily="Calibri"
          fontSize={48}
          letterSpacing={0}
          wordSpacing={0}
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"recognizer"}
            </tspan>
          </tspan>
        </text>
        <path
          d="M944.99 1019.9v302.38h302.38V1019.9H944.99z"
          className={classes.csvModule}
          onClick={() => onClick('segmenters')}
          onMouseEnter={() => setHover('segmenters')}
          onMouseLeave={() => removeHover('segmenters')}
          fill={state['segmenters'] ? hoveredModuleColor : moduleColor}
        />
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(990.4 1187.3)"
          fontFamily="Calibri"
          fontSize={48}
          letterSpacing={0}
          wordSpacing={0}
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"Segmenter"}
            </tspan>
          </tspan>
        </text>
        <path
          d="M1851.8 37.838v1587.3h188.95V37.838H1851.8z"
          fill={backgroundColor}
          fillRule="evenodd"
        />
        <text
          transform="translate(1883.9 847.77)"
          fontFamily="Calibri"
          fontSize={48}
          letterSpacing={0}
          wordSpacing={0}
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0}>
              {"Server"}
            </tspan>
          </tspan>
        </text>
        <path
          d="M604.85 113.51v302.22h302.38V113.51H604.85z"
          className={classes.csvModule}
          onClick={() => onClick('filters')}
          onMouseEnter={() => setHover('filters')}
          onMouseLeave={() => removeHover('filters')}
          fill={state['filters'] ? hoveredModuleColor : moduleColor}
        />
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(705.94 280.87)"
          fontFamily="Calibri"
          fontSize={48}
          letterSpacing={0}
          wordSpacing={0}
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"Filter"}
            </tspan>
          </tspan>
        </text>
        <path
          d="M1700.8 1149v45.438h151.19V1149H1700.8z"
          fill={dataStreamColor}
          fillRule="evenodd"
        />
        <path
          d="M1763.2 1155.9l26.559 15.839-26.559 15.839z"
          fill="#fff"
          fillRule="evenodd"
        />
      </g>
      <g fill={dataStreamColor} fillRule="evenodd">
        <path d="M907.23 242.15v45.278h944.75V242.15H907.23z" />
        <path d="M1118.7 264.71v302.22h-45.278V264.71zM1247.4 695.4v45.438h151.03V695.4H1247.4z" />
      </g>
      <g>
        <g fillRule="evenodd">
          <path d="M1309.5 702.28l26.559 15.839-26.559 15.839z" fill="#fff" />
          <path d="M1700.8 695.4v45.438h151.19V695.4H1700.8z" fill={dataStreamColor} />
          <path d="M1763 702.28l26.719 15.839L1763 733.958z" fill="#fff" />
          <path
            d="M1247.4 1149.1v45.278h151.03V1149.1H1247.4z"
            fill={dataStreamColor}
          />
          <path
            d="M1309.3 1155.9l26.719 15.839-26.719 15.839zM1112 413.98l-15.839 26.559-15.839-26.559z"
            fill="#fff"
          />
          <path d="M2381.1 642.61v377.9h188.95v-377.9H2381.1z" fill="#262626" />
        </g>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="rotate(-90 1716.905 -774.895)"
          fontFamily="Calibri"
          fontSize={48}
          letterSpacing={0}
          wordSpacing={0}
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"Application"}
            </tspan>
          </tspan>
        </text>
        <path
          d="M2192.1 642.61v377.9h188.95v-377.9H2192.1z"
          className={classes.csvModule}
          onClick={() => onClick('api')}
          onMouseEnter={() => setHover('api')}
          onMouseLeave={() => removeHover('api')}
          fill={state['api'] ? hoveredModuleColor : moduleColor}
        />
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(2254.1 847.77)"
          fontFamily="Calibri"
          fontSize={48}
          letterSpacing={0}
          wordSpacing={0}
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0}>
              {"API"}
            </tspan>
          </tspan>
        </text>
        <g fillRule="evenodd">
          <path
            d="M2040.8 840.36v45.438h151.19V840.36H2040.8z"
            fill={dataStreamColor}
          />
          <path d="M2103.2 847.24l26.559 15.839-26.559 15.839z" fill="#fff" />
          <path
            d="M2040.8 779.24v45.278h151.19V779.24H2040.8z"
            fill={dataStreamColor}
          />
          <path d="M2129.7 817.64l-26.559-15.839 26.559-15.839z" fill="#fff" />
          <path
            d="M1398.4 1020.7v302.38h302.38V1020.7H1398.4z"
            className={classes.csvModule}
            onClick={() => onClick('dynamic-recognizers')}
            onMouseEnter={() => setHover('dynamic-recognizers')}
            onMouseLeave={() => removeHover('dynamic-recognizers')}
            fill={state['dynamic-recognizers'] ? hoveredModuleColor : moduleColor}
          />
        </g>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(1465 1159.2)"
          fontFamily="Calibri"
          fontSize={48}
          letterSpacing={0}
          wordSpacing={0}
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"Dynamic"}
            </tspan>
          </tspan>
        </text>
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(1448.4 1216.8)"
          fontFamily="Calibri"
          fontSize={48}
          letterSpacing={0}
          wordSpacing={0}
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"recognizer"}
            </tspan>
          </tspan>
        </text>
        <path
          d="M1398.4 567.09v302.38h302.38V567.09H1398.4z"
          className={classes.csvModule}
          onClick={() => onClick('analyzers')}
          onMouseEnter={() => setHover('analyzers')}
          onMouseLeave={() => removeHover('analyzers')}
          fill={state['analyzers'] ? hoveredModuleColor : moduleColor}
        />
        <text
          className={classes.csvText}
          fill={moduleTextColor}
          transform="translate(1466.2 734.52)"
          fontFamily="Calibri"
          fontSize={48}
          letterSpacing={0}
          wordSpacing={0}
          style={{
            lineHeight: "125%",
          }}
        >
          <tspan x={0} y={0}>
            <tspan dx={0} dy={0} fill="#FFF">
              {"Analyzer"}
            </tspan>
          </tspan>
        </text>
        <g fillRule="evenodd">
          <path d="M1118.7 868.99v151.19h-45.278V868.99z" fill={dataStreamColor} />
          <path
            d="M1112 931.23l-15.839 26.719-15.839-26.719zM1453.8 249.03l26.719 15.839-26.719 15.839z"
            fill="#fff"
          />
        </g>
      </g>
    </svg>
  )
}

export default PipelineDiagram
