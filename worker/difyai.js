addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  let userInput;

  if (request.method === 'OPTIONS') {
    // 处理 CORS 预检请求
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*', // 允许所有来源
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // 检查请求方法
  if (request.method === 'GET') {
    const url = new URL(request.url);
    userInput = url.searchParams.get('input');
  } else if (request.method === 'POST') {
    const requestBody = await request.json();
    userInput = requestBody.input;
  } else {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  if (!userInput) {
    return new Response(JSON.stringify({ error: 'input is required' }), {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const apiResponse = await fetch('https://api.dify.ai/v1/workflows/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-HXINfpfGvs77bq2rSnbqPeeo',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: { input: userInput },
        response_mode: 'blocking',
        user: 'abc-123',
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return new Response(JSON.stringify({ error: 'API error', details: errorData }), {
        status: apiResponse.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    const apiResult = await apiResponse.json();
    const status = apiResult.data.status;
    const outputs = apiResult.data.outputs.output;

    const parsedOutput = JSON.parse(outputs);
    const result = {
      status: status,
      result: parsedOutput.result,
      output: parsedOutput.output,
    };

    return new Response(JSON.stringify(result), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error during fetch:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}
