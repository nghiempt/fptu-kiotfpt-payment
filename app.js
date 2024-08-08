const express = require('express');
const app = express();
const port = 3003;
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(express.json());

app.use(cors());
app.use(bodyParser.json());

app.post('/callback', async (req, res) => {
    console.log('Received callback request');
    console.log(req.body);
    let orderId = req.body.orderId.replace(/\D/g, '');
    let convertedDigits = orderId.split('').map((char) => {
        return (parseInt(char) % 9) + 1;
    }).join('');
    let lastFiveDigits = convertedDigits.slice(-5);
    const options = {
        method: 'GET',
        url: 'https://api.kiotfpt.store/v1/order/update-pay/' + lastFiveDigits.toString(),
    }
    console.log(options);
    let result = await axios(options);
    console.log(result.data);
    res.sendStatus(204);
});

app.post('/payment', async (req, res) => {
    var accessKey = 'F8BBA842ECF85';
    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var orderInfo = 'pay with MoMo';
    var partnerCode = 'MOMO';
    var redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
    var ipnUrl = 'http://103.56.160.96:3003/callback';
    var requestType = "captureWallet";
    var amount = '50000';
    var orderId = partnerCode + new Date().getTime();
    var requestId = orderId;
    var extraData = '';
    var orderGroupId = '';
    var autoCapture = true;
    var lang = 'vi';

    var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)
    const crypto = require('crypto');
    var signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
    console.log("--------------------SIGNATURE----------------")
    console.log(signature)

    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature
    });

    const options = {
        method: 'POST',
        url: 'https://test-payment.momo.vn/v2/gateway/api/create',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        },
        data: requestBody
    }

    let result;
    try {
        result = await axios(options);
        return res.status(200).json(result.data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});