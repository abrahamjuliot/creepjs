// Require new version and update on changes

const webapp = '[script id here]'

const formData = new FormData()
formData.append('email', 'worky976fd8..')

async function postData() {
  const response = await fetch(webapp, { method: 'POST', body: formData })
  return response.json()
}
postData()
    .then(data => console.log('Success!', console.log(data)))
    .catch(error => console.error('Error!', error.message))
