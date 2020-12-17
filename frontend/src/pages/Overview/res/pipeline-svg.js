import { React, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  csvModule: {
    cursor: 'pointer',
  },
  csvText: {
    pointerEvents: 'none',
  },
});

const useStyles = makeStyles(styles);

function SvgComponent(props) {
  const { onClick } = props;
  // Colors
  const backgroundColor = '#b3b3b3';
  const dataStreamColor = '#ccc';
  const hoveredModuleColor = '#222';
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
    'app-interface': false,
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
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 250 130'
      {...props}
    >
      <g transform='translate(-6)'>
        <rect
          width={220}
          height={130}
          x={21}
          ry={1.1}
          rx={1.1}
          fill={backgroundColor}
        />
        <path
          className={classes.csvModule}
          onClick={() => onClick('static-datasets')}
          onMouseEnter={() => setHover('static-datasets')}
          onMouseLeave={() => removeHover('static-datasets')}
          d='M21 50h21.4c.61 0 1.1.49 1.1 1.1v32.8c0 .61-.49 1.1-1.1 1.1H21z'
          fill={state['static-datasets'] ? hoveredModuleColor : moduleColor}
        />
        <path
          className={classes.csvModule}
          onClick={() => onClick('dynamic-datasets')}
          onMouseEnter={() => setHover('dynamic-datasets')}
          onMouseLeave={() => removeHover('dynamic-datasets')}
          d='M21 90h21.4c.61 0 1.1.49 1.1 1.1v32.8c0 .61-.49 1.1-1.1 1.1H21z'
          fill={state['dynamic-datasets'] ? hoveredModuleColor : moduleColor}
        />
        <path
          className={classes.csvModule}
          onClick={() => onClick('sensors')}
          onMouseEnter={() => setHover('sensors')}
          onMouseLeave={() => removeHover('sensors')}
          d='M21 5h21.4c.61 0 1.1.49 1.1 1.1v32.8c0 .61-.49 1.1-1.1 1.1H21z'
          fill={state['sensors'] ? hoveredModuleColor : moduleColor}
        />
        <rect
          className={classes.csvModule}
          onClick={() => onClick('static-recognizers')}
          onMouseEnter={() => setHover('static-recognizers')}
          onMouseLeave={() => removeHover('static-recognizers')}
          width={35}
          height={35}
          x={63.5}
          y={50}
          ry={1.1}
          rx={1.1}
          fill={state['static-recognizers'] ? hoveredModuleColor : moduleColor}
        />
        <rect
          className={classes.csvModule}
          onClick={() => onClick('analyzers')}
          onMouseEnter={() => setHover('analyzers')}
          onMouseLeave={() => removeHover('analyzers')}
          width={35}
          height={35}
          x={108.5}
          y={50}
          ry={1.1}
          rx={1.1}
          fill={state['analyzers'] ? hoveredModuleColor : moduleColor}
        />
        <rect
          className={classes.csvModule}
          onClick={() => onClick('segmenters')}
          onMouseEnter={() => setHover('segmenters')}
          onMouseLeave={() => removeHover('segmenters')}
          width={35}
          height={20}
          x={96}
          y={90}
          ry={0.733}
          rx={1.1}
          fill={state['segmenters'] ? hoveredModuleColor : moduleColor}
        />
        <rect
          className={classes.csvModule}
          onClick={() => onClick('dynamic-recognizers')}
          onMouseEnter={() => setHover('dynamic-recognizers')}
          onMouseLeave={() => removeHover('dynamic-recognizers')}
          width={35}
          height={35}
          x={141}
          y={90}
          ry={0.77}
          rx={1.1}
          fill={state['dynamic-recognizers'] ? hoveredModuleColor : moduleColor}
        />
        <rect
          className={classes.csvModule}
          onClick={() => onClick('filters')}
          onMouseEnter={() => setHover('filters')}
          onMouseLeave={() => removeHover('filters')}
          width={20}
          height={35}
          x={53.5}
          y={5}
          ry={1.1}
          rx={0.629}
          fill={state['filters'] ? hoveredModuleColor : moduleColor}
        />
        <rect
          className={classes.csvModule}
          onClick={() => onClick('server')}
          onMouseEnter={() => setHover('server')}
          onMouseLeave={() => removeHover('server')}
          width={22.5}
          height={120}
          x={186}
          y={5}
          ry={1.1}
          rx={1.65}
          fill={state['server'] ? hoveredModuleColor : moduleColor}
        />
        <path
          className={classes.csvModule}
          onClick={() => onClick('app-interface')}
          onMouseEnter={() => setHover('app-interface')}
          onMouseLeave={() => removeHover('app-interface')}
          d='M241 50h-21.4c-.61 0-1.1.49-1.1 1.1v32.8c0 .61.49 1.1 1.1 1.1H241z'
          fill={state['app-interface'] ? hoveredModuleColor : moduleColor}
        />
        <path
          d='M241 50h13.907c.605 0 1.093.49 1.093 1.1v32.8c0 .61-.488 1.1-1.093 1.1H241z'
          fill={extModuleColor}
        />
        <rect
          width={97.5}
          height={5}
          x={43.5}
          y={115}
          rx={0}
          ry={0}
          fill={dataStreamColor}
        />
        <rect
          width={17.5}
          height={5}
          x={-96}
          y={97.5}
          rx={0}
          ry={0}
          transform='scale(-1 1)'
          fill={dataStreamColor}
        />
        <rect
          width={17.5}
          height={5}
          x={85}
          y={-83.5}
          rx={0}
          ry={0}
          transform='rotate(90)'
          fill={dataStreamColor}
        />
        <path d='M73.5 20H186v5H73.5z' fill={dataStreamColor} />
        <rect
          width={42.5}
          height={5}
          x={143.5}
          y={65}
          rx={0}
          ry={0}
          fill={dataStreamColor}
        />
        <rect
          width={10}
          height={5}
          x={208.5}
          y={68}
          rx={0}
          ry={0}
          fill={dataStreamColor}
        />
        <g fill={backgroundColor}>
          <path d='M129.333 20l2.5 2.5-.833.833L127.667 20z' />
          <path d='M131 21.667l.833.833-2.5 2.5h-1.666z' />
        </g>
        <g fill={backgroundColor} strokeWidth={1.029}>
          <path d='M164.356 65l2.362 2.5-.788.833L162.782 65z' />
          <path d='M165.93 66.667l.788.833-2.362 2.5h-1.574z' />
        </g>
        <g fill={backgroundColor}>
          <path d='M213.083 68l2.5 2.5-.833.833L211.417 68z' />
          <path d='M214.75 69.667l.833.833-2.5 2.5h-1.666z' />
        </g>
        <g fill={backgroundColor} strokeWidth={1.04}>
          <path d='M91.864 115l2.313 2.5-.77.833L90.322 115z' />
          <path d='M93.406 116.667l.771.833-2.312 2.5h-1.542z' />
        </g>
        <g fill={backgroundColor}>
          <path d='M86.833 97.5l2.5 2.5-.833.833-3.333-3.333z' />
          <path d='M88.5 99.167l.833.833-2.5 2.5h-1.666z' />
        </g>
        <g fill={backgroundColor}>
          <path d='M48.5 67.917l-2.5-2.5-.833.833 3.333 3.333z' />
          <path d='M46.833 66.25L46 65.417l-2.5 2.5v1.666z' />
        </g>
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={80.858}
          y={66.098}
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          fill={moduleTextColor}
          strokeWidth={0.265}
        >
          <tspan
            x={80.858}
            y={66.098}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'Static '}
          </tspan>
          <tspan
            x={80.858}
            y={71.222}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'recognizer'}
          </tspan>
        </text>
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={158.358}
          y={106.098}
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          fill={moduleTextColor}
          strokeWidth={0.265}
        >
          <tspan
            x={158.358}
            y={106.098}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'Dynamic '}
          </tspan>
          <tspan
            x={158.358}
            y={111.222}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'recognizer'}
          </tspan>
        </text>
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={113.457}
          y={101.143}
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          fill={moduleTextColor}
          strokeWidth={0.265}
        >
          <tspan
            x={113.457}
            y={101.143}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'Segmenter'}
          </tspan>
        </text>
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={126}
          y={68.741}
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          fill={moduleTextColor}
          strokeWidth={0.265}
        >
          <tspan
            x={126}
            y={68.741}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'Analyzer'}
          </tspan>
        </text>
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={197.2}
          y={66.783}
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          fill={moduleTextColor}
          strokeWidth={0.265}
        >
          <tspan
            x={197.2}
            y={66.783}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'Server'}
          </tspan>
        </text>
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={32.227}
          y={63.561}
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          fill={moduleTextColor}
          strokeWidth={0.265}
        >
          <tspan
            x={32.227}
            y={63.561}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'Static '}
          </tspan>
          <tspan
            x={32.227}
            y={68.684}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'dataset'}
          </tspan>
          <tspan
            x={32.227}
            y={73.807}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'loader(s)'}
          </tspan>
        </text>
        <path
          d='M21 50H7.094C6.488 50 6 50.49 6 51.1v32.8c0 .61.488 1.1 1.094 1.1H21z'
          fill={extModuleColor}
        />
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={-67.338}
          y={12.123}
          transform='rotate(-90)'
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          strokeWidth={0.265}
        >
          <tspan
            x={-67.338}
            y={12.123}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
            fill={extModuleTextColor}
          >
            {'Static'}
          </tspan>
          <tspan
            x={-67.338}
            y={17.246}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
            fill={extModuleTextColor}
          >
            {' dataset(s)'}
          </tspan>
        </text>
        <path
          d='M21 90H7.094C6.488 90 6 90.49 6 91.1v32.8c0 .61.488 1.1 1.094 1.1H21z'
          fill={extModuleColor}
        />
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={-107.339}
          y={12.123}
          transform='rotate(-90)'
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          strokeWidth={0.265}
        >
          <tspan
            x={-107.339}
            y={12.123}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
            fill={extModuleTextColor}
          >
            {'Dynamic'}
          </tspan>
          <tspan
            x={-107.339}
            y={17.246}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
            fill={extModuleTextColor}
          >
            {' dataset(s)'}
          </tspan>
        </text>
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={32.251}
          y={21.106}
          fontWeight={400}
          fontSize={4.5}
          fontFamily='sans-serif'
          textAnchor='middle'
          fill={moduleTextColor}
          strokeWidth={0.265}
        >
          <tspan
            x={32.251}
            y={21.106}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'Sensor'}
          </tspan>
          <tspan
            x={32.251}
            y={26.229}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'interface(s)'}
          </tspan>
        </text>
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={32.227}
          y={103.561}
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          fill={moduleTextColor}
          strokeWidth={0.265}
        >
          <tspan
            x={32.227}
            y={103.561}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'Dynamic'}
          </tspan>
          <tspan
            x={32.227}
            y={108.684}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'dataset'}
          </tspan>
          <tspan
            x={32.227}
            y={113.808}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'loader(s)'}
          </tspan>
        </text>
        <path
          d='M21 5H7.094C6.488 5 6 5.49 6 6.1v32.8c0 .61.488 1.1 1.094 1.1H21z'
          fill={extModuleColor}
        />
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={-22.424}
          y={14.795}
          transform='rotate(-90)'
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          strokeWidth={0.265}
        >
          <tspan
            x={-22.424}
            y={14.795}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
            fill={extModuleTextColor}
          >
            {'Sensor(s)'}
          </tspan>
        </text>
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={63.335}
          y={24.157}
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          fill={moduleTextColor}
          strokeWidth={0.265}
        >
          <tspan
            x={63.335}
            y={24.157}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'Filter'}
          </tspan>
        </text>
        <rect
          width={10}
          height={5}
          x={43.471}
          y={20}
          rx={0}
          ry={0}
          fill={dataStreamColor}
        />
        <g fill={backgroundColor}>
          <path d='M48.054 20l2.5 2.5-.833.833L46.387 20z' />
          <path d='M49.72 21.667l.834.833-2.5 2.5h-1.667z' />
        </g>
        <rect width={20} height={5} x={43.5} y={65} rx={0} ry={0} fill={dataStreamColor} />
        <g fill={backgroundColor}>
          <path d='M53.083 65l2.5 2.5-.833.833L51.417 65z' />
          <path d='M54.75 66.667l.833.833-2.5 2.5h-1.666z' />
        </g>
        <rect
          width={30}
          height={5}
          x={20}
          y={-83.5}
          rx={0}
          ry={0}
          transform='rotate(90)'
          fill={dataStreamColor}
        />
        <g fill={backgroundColor}>
          <path d='M83.5 37.229l-2.5 2.5-.833-.833 3.333-3.333z' />
          <path d='M81.833 38.896l-.833.833-2.5-2.5v-1.666z' />
        </g>
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={-67.364}
          y={249.741}
          transform='rotate(-90)'
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          strokeWidth={0.265}
        >
          <tspan
            x={-67.364}
            y={249.741}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
            fill={extModuleTextColor}
          >
            {'Application'}
          </tspan>
        </text>
        <text
          className={classes.csvText}
          style={{
            lineHeight: 1,
            textAlign: 'center',
          }}
          x={229.708}
          y={66.085}
          fontWeight={400}
          fontSize={4.939}
          fontFamily='sans-serif'
          textAnchor='middle'
          fill={moduleTextColor}
          strokeWidth={0.265}
        >
          <tspan
            x={229.708}
            y={66.085}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'app-'}
          </tspan>
          <tspan
            x={229.708}
            y={71.208}
            style={{
              InkscapeFontSpecification: 'Calibri',
              textAlign: 'center',
            }}
            fontFamily='Calibri'
          >
            {'interface'}
          </tspan>
        </text>
        <rect
          width={10}
          height={5}
          x={-218.5}
          y={62}
          rx={0}
          ry={0}
          transform='scale(-1 1)'
          fill={dataStreamColor}
        />
        <g fill={backgroundColor}>
          <path d='M213.917 62l-2.5 2.5.833.833L215.583 62z' />
          <path d='M212.25 63.667l-.833.833 2.5 2.5h1.666z' />
        </g>
        <rect
          width={10}
          height={5}
          x={176}
          y={104.5}
          rx={0}
          ry={0}
          fill={dataStreamColor}
        />
        <g fill={backgroundColor}>
          <path d='M180.583 104.5l2.5 2.5-.833.833-3.333-3.333z' />
          <path d='M182.25 106.167l.833.833-2.5 2.5h-1.666z' />
        </g>
        <rect
          width={10}
          height={5}
          x={131}
          y={97.5}
          rx={0}
          ry={0}
          fill={dataStreamColor}
        />
        <g fill={backgroundColor}>
          <path d='M135.583 97.5l2.5 2.5-.833.833-3.333-3.333z' />
          <path d='M137.25 99.167l.833.833-2.5 2.5h-1.666z' />
        </g>
        <rect
          width={10}
          height={5}
          x={98.5}
          y={64.5}
          rx={0}
          ry={0}
          fill={dataStreamColor}
        />
        <g fill={backgroundColor}>
          <path d='M103.083 64.5l2.5 2.5-.833.833-3.333-3.333z' />
          <path d='M104.75 66.167l.833.833-2.5 2.5h-1.666z' />
        </g>
      </g>
    </svg>
  )
}

export default SvgComponent
