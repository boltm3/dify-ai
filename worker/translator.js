export default {
    async fetch(request, env) {
        let userInput;
  
        // 处理 GET 请求
        if (request.method === 'GET') {
            const url = new URL(request.url);
            userInput = url.searchParams.get('input');
        }
        // 处理 POST 请求
        else if (request.method === 'POST') {
            const requestBody = await request.json();
            userInput = requestBody.input;
        } else {
            return new Response('Method Not Allowed', {
                status: 405
            });
        }
  
        // 检查是否存在输入
        if (!userInput) {
            return new Response(JSON.stringify({
                error: 'input is required'
            }), {
                status: 400
            });
        }
  
        // 定义输入，并添加提示词
        const inputs = {
            text: userInput,
            prompt: 'Translate it to English, keeping the meaning intact.  Only translate, without any unnecessary additions.',
            target_lang: 'en', // 目标语言为英语
        };
  
        try {
            // 调用 AI 运行翻译模型
            const response = await env.AI.run('@cf/meta/m2m100-1.2b', inputs);
  
            // 返回结果
            return Response.json({
                inputs,
                translated: response
            }, {
                status: 200
            });
        } catch (error) {
            console.error('Error during AI fetch:', error);
            return new Response(JSON.stringify({
                error: 'Failed to process request'
            }), {
                status: 500
            });
        }
    },
  };