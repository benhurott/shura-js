const { hydrateSchema } = require('./utils')

module.exports = {
    '*': 'boolean',
    extract: (schema, value) => {
        hydrateSchema(schema)

        if (value === true || value === false) {
            return value
        } else {
            schema.onValidationFailed(schema, value, 'not_a_boolean')
            return undefined
        }
    }
}
