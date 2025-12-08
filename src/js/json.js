import { capitalizePrint, addHeader } from './functions'
import Print from './print'

export default {
  print: (params, printFrame) => {
    // Check if we received proper data
    if (typeof params.printable !== 'object') {
      throw new Error('Invalid javascript data object (JSON).')
    }

    // Validate repeatTableHeader
    if (typeof params.repeatTableHeader !== 'boolean') {
      throw new Error('Invalid value for repeatTableHeader attribute (JSON).')
    }

    // Validate properties
    if (!params.properties || !Array.isArray(params.properties)) {
      throw new Error('Invalid properties array for your JSON data.')
    }

    // We will format the property objects to keep the JSON api compatible with older releases
    params.properties = params.properties.map(property => {
      return {
        field: typeof property === 'object' ? property.field : property,
        displayName: typeof property === 'object' ? property.displayName : property,
        columnSize: typeof property === 'object' && property.columnSize ? property.columnSize + ';' : 100 / params.properties.length + '%;'
      }
    })

    // Create a print container element
    params.printableElement = document.createElement('div')

    // Check if we are adding a print header
    if (params.header) {
      addHeader(params.printableElement, params)
    }

    // Build the printable html data
    params.printableElement.innerHTML += jsonToHTML(params)

    // Print the json data
    Print.send(params, printFrame)
  }
}

function jsonToHTML (params) {
  // Get the row and column data
  const data = params.printable
  const properties = params.properties

  // Generate style element with nonce if provided
  let styleId = 'printjs-json-styles'
  let styleTag = params.nonce 
    ? '<style nonce="' + params.nonce + '" id="' + styleId + '">'
    : '<style id="' + styleId + '">'
  
  styleTag += `
    .printjs-json-table { border-collapse: collapse; width: 100%; }
    .printjs-json-th { ${params.gridHeaderStyle} }
    .printjs-json-td { ${params.gridStyle} }
  `

  // Add individual column width styles
  for (let a = 0; a < properties.length; a++) {
    styleTag += `.printjs-json-col-${a} { width: ${properties[a].columnSize} }`
  }
  
  styleTag += '</style>'

  let htmlData = styleTag + '<table class="printjs-json-table">'

  // Check if the header should be repeated
  if (params.repeatTableHeader) {
    htmlData += '<thead>'
  }

  // Add the table header row
  htmlData += '<tr>'

  // Add the table header columns
  for (let a = 0; a < properties.length; a++) {
    htmlData += '<th class="printjs-json-th printjs-json-col-' + a + '">' + capitalizePrint(properties[a].displayName) + '</th>'
  }

  // Add the closing tag for the table header row
  htmlData += '</tr>'

  // If the table header is marked as repeated, add the closing tag
  if (params.repeatTableHeader) {
    htmlData += '</thead>'
  }

  // Create the table body
  htmlData += '<tbody>'

  // Add the table data rows
  for (let i = 0; i < data.length; i++) {
    // Add the row starting tag
    htmlData += '<tr>'

    // Print selected properties only
    for (let n = 0; n < properties.length; n++) {
      let dataEntry = data[i]
      let stringData = dataEntry[properties[n].field]

      // Support nested objects
      if (params.expandNestedJsonObjects) {
        const property = properties[n].field.split('.')
        if (property.length > 1) {
          for (let p = 0; p < property.length; p++) {
            // Traverse down the object structure to the final value
            dataEntry = dataEntry[property[p]]
          }
          stringData = dataEntry
        }
      }

      // Add the row contents and styles
      htmlData += '<td class="printjs-json-td printjs-json-col-' + n + '">' + stringData + '</td>'
    }

    // Add the row closing tag
    htmlData += '</tr>'
  }

  // Add the table and body closing tags
  htmlData += '</tbody></table>'

  return htmlData
}
