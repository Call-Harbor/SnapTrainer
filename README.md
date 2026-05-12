**SnapTrainer**

SnapTrainer is an open source AI platform for personal AIFaces, multi-agent orchestration, advanced training, URL/FAQ knowledge sources, and user-owned AI workflows.

All models in the product are positioned as free to use. The platform is intended to be supported by voluntary donations rather than paid model tiers or paywalls.

To configure the PayPal donation button, set:

```
VITE_PAYPAL_DONATION_URL=https://www.paypal.com/donate?hosted_button_id=YOUR_BUTTON_ID
```

If the variable is not set, the app falls back to PayPal's generic donation page.

**Base44 project notes**

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
