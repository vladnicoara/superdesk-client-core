# superdesk-client-core

[![Build Status](https://travis-ci.org/superdesk/superdesk-client-core.svg?branch=master)](https://travis-ci.org/superdesk/superdesk-client-core)
[![Code Climate](https://codeclimate.com/github/superdesk/superdesk-client-core/badges/gpa.svg)](https://codeclimate.com/github/superdesk/superdesk-client-core)
### Installation

For installation instructions, please refer to the README file at: [https://github.com/superdesk/superdesk/](https://github.com/superdesk/superdesk/ "")

### Config options

##### Server

- `server.url` - superdesk rest api server url
- `server.ws` - superdesk websocket server url

##### Services

- `iframely.key` - iframely api key
- `raven.dsn` - sentry api key
- `analytics.ga` - google analytics id
- `analytics.piwik.url` - piwik analytics url
- `analytics.piwik.id` - piwik application id

##### Features

- `feature.preview`: `false` - enables print preview in authoring
- `feature.alchemy`: `false` - allow alchemy widget for keywords

##### Workspace
- `workspace.content`: `false` - enable content view in workspace (obsolete)
- `workspace.ingest`: `false` - enable ingest view in workspace (obsolete)

##### Editor

- `editor.toolbar`: `object|false` - editor toolbar configuration, set to `false` to disable toolbar
- `editor.embeds`: `true` - enable embedding in article body

##### Date & Time

- `defaultTimezone`: `'Europe/London'` - default timezone for date time pickers
- `view.dateformat`: `'MM/DD/YYYY'` - presented date format for datepickers
- `view.timeformat`: `'HH:mm'` - presented time format for timepickers
- `shortTimeFormat`: `'hh:mm'` - format for current day in item list
- `shortWeekFormat`: `'dddd, hh:mm'` - format for current week in item list
- `shortDateFormat`: `'MM/DD'` - format for other days in item list
- `longDateFormat`: `'LLL'` - format with full date and time

##### Authoring

- `previewSubjectFilterKey`: `null` - full preview in authoring displays only matching subjects

##### UI

- `ui.italicAbstract`: `true` - render abstract using italics

##### List

You can configure what will be displayed in list views, there are 3 areas in list which you can configure:

- `priority` - second box, you can use there `priority` and `urgency`, in case you use also `secondLine` both

- `firstLine` - main area - defaults are:
    - `wordcount`
    - `slugline`
    - `headline`
    - `versioncreated`

- `secondLine` - optional second line - defaults are:
    - `profile`
    - `state` - workflow state
    - `embargo` - flag if item is embargoed
    - `update` - flag if item is an update
    - `takekey`
    - `takepackage` - link to other takes
    - `signal`
    - `broadcast`
    - `flags` - flags for "not for publication", "sms"
    - `updated` - flag if an item was updated
    - `category` - anpa category
    - `provider` - ingest provider info
    - `expiry` - expiry of spiked items
    - `desk` - where an item was fetched for ingested, where an item is for others

###### Single line config example

Use this for "minimal" view with only slugline and headline, state and timestamp.

```
config.list = {
    priority: ['urgency'],
    firstLine: ['slugline', 'headline', 'state', 'versioncreated']
}
```
