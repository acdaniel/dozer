# dozer
> Rest API interface for MongoDB

Simple command line application for adding a REST API on top of a MongoDB
database.

Access to the API is controlled via JSON Web Tokens (JWT) that can easily be
created using the the cli. Tokens can contain granted scopes that limit access
to specific collections and methods performed on those collections.

NOTE: More documentation to come.

## Install
```
$ npm install --global dozer
```

## CLI Server Usage
```
$ ./dozer help server

  Usage: dozer-server [options] [command]


  Commands:

    start [options] [config]  Start a dozer server

  Options:

    -h, --help  output usage information
```

## CLI Tokens Usage
```
$ ./dozer help tokens

  Usage: dozer-tokens [options] [command]


  Commands:

    create [options] [config]  Creates a new token used to access the API
    verify [options] [config]  Verifies that the given token is valid and displays token information
    decode [options] [config]  Decodes the given token and displays token information

  Options:

    -h, --help  output usage information
```

## CLI Client Usage
```
$ ./dozer help client

  Usage: dozer-client [options] [command]


  Commands:

    get|find [options] <uri>     Send GET request to dozer server
    post|insert [options] <uri>  Send POST request to dozer server
    put|update [options] <uri>   Send PUT request to dozer server
    delete|del [options] <uri>   Send DELETE request to dozer server

  Options:

    -h, --help  output usage information
```

## Module Usage

TODO

## License

ISC © Adam Daniel
