const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./<credential>.json');
const app = express();
app.use(bodyParser.json());

// Initialize Firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: '<databaseURL>',
  projectId: '<projectId>',
});

app.post('/set-feature-flag', async (req, res) => {
  try {
    const remoteConfig = admin.remoteConfig();
    const template = await remoteConfig.getTemplate();
    console.log(JSON.stringify(template.conditions, undefined, 4));

    const featureFlags = req.body;
    for (const [key, value] of Object.entries(featureFlags)) {
      const featureFlag = key.toUpperCase();
      const emailString =
        '^(' +
        value.condition.emails
          .map(email => `${email.toUpperCase()}`)
          .join('|') +
        ')$';
      const newCondition = {
        name: `${featureFlag} Segment`,
        expression: `app.userProperty['user_email'].matches(['${emailString}'])`,
      };
      console.log({newCondition});
      const index = template.conditions.findIndex(
        condition => condition.name === newCondition.name,
      );
      index >= 0
        ? (template.conditions[index] = newCondition)
        : template.conditions.push(newCondition);

      template.parameters[`FEATURE_FLAG_${featureFlag}`] = {
        defaultValue: {value: 'false'},
        conditionalValues: {
          [`${newCondition.name}`]: {value: 'true'},
        },
        valueType: 'BOOLEAN',
      };
    }
    const updatedTemplate = await remoteConfig.createTemplateFromJSON(
      JSON.stringify(template),
    );
    // console.log(JSON.stringify(template.parameters, undefined, 4))
    const newTemplate = await remoteConfig.publishTemplate(updatedTemplate);

    // res.json({ success: true, message: 'Audience segment created successfully' });
    res.json(newTemplate.conditions);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({success: false, message: 'Failed to create audience segment'});
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
