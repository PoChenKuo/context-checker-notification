# Context checker and notification

A simple tool for detecting context, filtering with conditions, and notifying with Gmail.

## Prerequisite
- NodeJs 17.9.1
- Google could platform project
 -- OAuth2.0 credentials

## Configs
### config.ini
[site]

href= _your_target_page_url_  (eg. www.google.com)

target= _css_selector_ (eg. body > table ...)

[email]

target=your@gmail.com (sender and receiver)

subject=_email_subject_

context= email context<br/>__have__a__good__day.

[condition]

0=NOTHAS _the_content_you_do_not_want_to_have_in_element_

1=HAS _the_content_you_do_want_to_have_in_element_

2=HAS _the_content_you_do_want_to_have_in_element_2

...

### credentials.json
* download after OAuth 2.0 client id generated

### token.json
* auto-generate after first-time authorization.

## Run

```sh
npm i
node app checker.js
```
