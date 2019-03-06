# 🗃 pico-gist
An incredibly tiny library for using github gists as a datastore


Excellent for prototyping.

`picogist` maps key-value pairs in objects to individual files within a single gist.



### API

##### `picogist(github_token, [opts])` -> picogist instance

Creates a picogist instance configured with the provided token and any options

*Options*

- `filter` :



##### `gist.create(object, [isPublic=true])`


##### `gist.fetch()` -> array of data
Fetches all the gists that pass the `opts.filter` function and converts them all to data objects.


##### `gist.get(gistId)` -> object


