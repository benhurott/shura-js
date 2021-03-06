![shurajs](resources/shura-js-logo.png)


# shura-js
A simple and extensible json schema extractor for NodeJS.

![build status](https://travis-ci.org/benhurott/shura-js.svg?branch=master)

## Motivation
When we use a NoSql database such MongoDB or Firebase, we need to prevent user to input some invalid additional data to our database. This lib will help you to preserve the schema of your data.

Ex: <br />
Your schema for user data is:
```json
{
    "name": "Ben-hur Santos Ott",
    "email": "ben-hur@email.com",
    "role": "Developer"
}
```

You api normaly validate if the `name` is a valid string, the `email` is a valid e-mail address and `role` is one of listed items.

Ok, if all of this is valid, pass the data to databse.

Buuuut, if a matrix hacker attacks your api directly sending:
```json
{
    "name": "Ben-hur Santos Ott",
    "email": "ben-hur@email.com",
    "role": "Developer",

    "_hack_": "<some giant string like img base64>"
}
```

Do you validate if user is sending additional invalid data?

If your answer is `YES`, congratulations. Otherwise, you have a great issue in your application.

## Using ShuraJS

Install it:
```
npm install --save shurajs
```

Using the previous example

First: create a schema for your object.

```js
const shurajs = require('shurajs')

const schema = {
    "name": {
        "*": "string"
    },
    "email": {
        "*": "string"
    },
    "role": {
        "*": "string"
    }
}
```

Second: extract valid object.

```js
//...
const dataToBeSaved = {
    "name": "Ben-hur Santos Ott",
    "email": "ben-hur@email.com",
    "role": "Developer",

    "_hack_": "<some giant string like img base64>"
}

const sanitized = shurajs.extract(dataToBeSaved, schema)
console.log(sanitized)
```

Console will log this:
```json
{
    "name": "Ben-hur Santos Ott",
    "email": "ben-hur@email.com",
    "role": "Developer"
}
```

## API
In previous sample, you saw:
```js
{
    "name": {
        "*": "string"
    }
    //...
}
```

This is the extractor template shurajs uses to validate, parse and extract using this rule:
* the property `name` is not `null`, not `undefined` and is a `string`?
    * `false`: don't include this node on result.
    * `true`: include in result

Now, let's see available apis:

*Notes*: `Error Codes` is used in `onValidationFailed` on `Global` section.

### String
Validate if value is a string
```js
{
    "*": "string",

    // valid if string length has min 10 characters
    // (optional, int, default null)
    "minLength": 10, 

    // valid if string length has no more than 50 characters
    // (optional, int, default null)
    "maxLength": 50,

    // validate if regex matches the value
    // (optional, regex, default null)
    "regex": /[0-9]/,

    // consideting valid if string has length 0 or contains only white spaces.
    // (optional, boolean, default true)
    "allowEmpty": true
}
```

Error Codes:
```
not_a_string -> the value is not a string
min_length -> the value has less characters than expected
max_length -> the value has more characters than expected
regex -> the regex not matched
is_empty -> raises when allowEmpty=true validation failed
```

### Number
Validate if value is a number
```js
{
    "*": "number",

    // validate if value is greather or equal then 2
    // (optional, int, default null)
    "min": 2,

    // validate if value is less or equal then 100
    // (optional, int, default null)
    "max": 100,

    // validate if value is negative
    // (optional, boolean, default true)
    "allowNegative": true,

    // validate if value is positive (zero is positive for us)
    // (optional, boolean, default true)
    "allowPositive": true,
}
```

Error Codes:
```
not_a_number -> the value is not a number
min -> the value is minor then the expected
max -> the value is major then the expected
is_negative -> the value is negative for allowNegative=false
is_positive -> the value is positive for allowPositive=false
```

### Boolean
Validate if value is a boolean
```js
{
    "*": "boolean"
}
```

Error Codes:
```
not_a_boolean -> the value is not a boolean
```

### Object
Validate object structure
```js
{
    "*": "object",

    // definition is the structure of your model.
    "definition": {
        "myNameProperty": {
            "*": "string"
        },
        "myAgeProperty": {
            "*": "number",
            "min": 5,
            "max": 100
        }
    }
}
```

Sample:
```js
const shurajs = require('shurajs')

const model = {
    "name": "Ben-hur Santos Ott",
    "contacts": {
        "email": "ben-hur@email.com",
        "phone": "+55 51 99999-9999"
    }
}

const schema = {
    "name": { 
        "*": "string",
        "minLength": 5,
        "maxLength": 100
    },
    "contacts": {
        "*": "object",
        "definition": {
            "email": { 
                "*": "string",
                "regex": /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            },
            "phone": {
                "*": "string",
                "required": false
            }
        }
    }
}

const sanitized = shurajs.extract(model, schema)
```

Error Codes:
```
not_a_object -> value is not null, not undefined and not an object
```

### Array
Validate if value is an array. If you want, you can check types of elements inside the array.

```js
{
    "*": "array",
    
    // validate if array has one or more elements
    // (optional, int, default null)
    "minLength": 1,

    // validate if array has no more than 30 elements
    // (optional, int, default null)
    "maxLength": 30,

    // validate if values inside the array matches a schema.
    // you can pass more then one schema, if you do this, if the
    // first schema fails, try the second and so on.
    // if one of the schemas pass the validation, the data will be included on result.
    // the invalid items will be removed from array
    // (optional, array, default [])
    "innerTypes": [
        {
            "*": "object",
            // same as type: object...
        },
        {
            "*": "string",
            // ....
        }
    ],

    // when validation fails in extractor, the property will be deleted.
    // in some cases, you want to preserve property and has some default
    // value (like empty array). 
    // use this prop for it.
    // (optional, any, default undefined)
    "resolveInvalidAs": undefined
}
```

Error Codes:
```
not_a_array -> value is not an array
min_length -> array has less items then expected
max_length -> array has more items then expected
inner_type_validation_failed -> some value not match with inner type
```

### oneOf
Validate if value is one of listed values (using `===` for comparison)
```js
{
    "*": "oneOf",

    // list of items to compare with value
    "items": [10, "test", null]
}
```

Error Codes:
```
invalid_item -> the value is not in the items range.
```

### Global
All templates include these properties if you want to use:

```js
{
    "*": "<any type>",
    
    // if set to true and property value is null or undefined
    // it will force `onValidationFailed` to be trigged
    // (optional, boolean, default false)
    "required": false,

    // by default, shurajs ignore the node if value is undefined.
    // if you want a default value for invalid node, just set this
    // property with your custom value
    // (optional, any type, default undefined)
    "defaultValue": undefined,

    // when some schema validation failed, this method will be called.
    // use it for custom error behavior (like raise an exception for example.)
    "onValidationFailed": (schema, originalValue, errorCode) => {
        //...
    }

    // after shurajs parses the value and apply all the rules,
    // it will resolve the value and set it on the result node.
    // if you want to validate value manualy after shura (in case
    // you have some complex validation, for example) you can use
    // this method.
    // the value you returned on `afterValidation` will be the result
    // of the node.
    // (optional, schema:value func, default return current value)
    "afterValidation": (schema, currentValue) => {
        //...
        return currentValue
    }
}
```


## Extending ShuraJS
If you want to create your custom extractors, just use the `mixin` function.

So, if want to create a default `age validation schema` that validate number < 18 or > 99:
```js
const shurajs = require('shurajs')

const schema = {
    age: {
        '*': 'age'
    }
}

const model = {
    age: 42
}

const sanitized = shurajs.extract(schema, model)
```

You will create some like this:
```js
const shurajs = require('shurajs')

shurajs.mixin('age', (schema, value) => {
    // in this case, the schema will have this obj:
    // {
    //     '*': 'age'
    // }

    // the value has: 42

    if (value < 18 || value > 99) {
        // by default, if you return `undefined`,
        // shurajs will consider it a invalid result
        // and will not include in the object node.
        return undefined
    }

    // after all validations, return a value that be include
    // in the result node
    return value
})

```


## Thanks to
Icon: <div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>


## Changelog

### 0.12.1
* Fixing `defaultValue` on `object` api.

### 0.12.0
* Refactoring `middleware` to `afterValidation`

**Breaking Change**<br />
`middleware` no longer works, use `afterValidation` instead.

### 0.11.0
* Adding `onValidationFailed` to schemas.

**Breaking Change**<br />
`required` now trigger `onValidationFailed` instead raising error.

### 0.10.0
* Adding `middleware`.

### 0.9.0
* Adding `defaultValue`.

### 0.8.0
* Adding `mixins`.

### 0.7.1
* First version =D
