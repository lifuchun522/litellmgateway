package com.qvsu.quartz.util;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.LinkedList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.qvsu.common.utils.StringUtils;
import com.qvsu.common.utils.spring.SpringUtils;
import com.qvsu.quartz.domain.SysJob;

/**
 * 任务执行工具
 *
 * @author qvsu
 */
public class JobInvokeUtil
{
    private static final Logger log = LoggerFactory.getLogger(JobInvokeUtil.class);

    /**
     * 执行方法
     *
     * @param sysJob 系统任务
     */
    public static void invokeMethod(SysJob sysJob) throws Exception
    {
        // 判断调度类型
        if (SysJob.JOB_TYPE_HTTP.equals(sysJob.getJobType()))
        {
            // HTTP调用
            invokeHttp(sysJob);
        }
        else
        {
            // Bean调用
            invokeBean(sysJob);
        }
    }

    /**
     * 执行HTTP调用
     *
     * @param sysJob 系统任务
     */
    private static void invokeHttp(SysJob sysJob)
    {
        String url = sysJob.getRequestUrl();
        String method = sysJob.getRequestMethod();
        String headersJson = sysJob.getRequestHeaders();
        String body = sysJob.getRequestBody();
        Integer timeout = sysJob.getTimeout();

        log.info("[定时任务-HTTP] 开始执行: jobName={}, method={}, url={}", sysJob.getJobName(), method, url);

        try
        {
            RestTemplate restTemplate = SpringUtils.getBean(RestTemplate.class);
            HttpMethod httpMethod = HttpMethod.resolve(method.toUpperCase());
            if (httpMethod == null)
            {
                log.error("[定时任务-HTTP] 不支持的请求方法: {}", method);
                return;
            }

            // 解析请求头
            HttpHeaders headers = parseHeaders(headersJson);
            if (body != null && !body.isEmpty())
            {
                headers.set("Content-Type", sysJob.getContentType() != null ? sysJob.getContentType() : "application/json");
            }

            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, httpMethod, entity, String.class);

            log.info("[定时任务-HTTP] 执行完成: jobName={}, httpStatus={}", sysJob.getJobName(), response.getStatusCodeValue());
            log.debug("[定时任务-HTTP] 响应内容: {}", response.getBody());
        }
        catch (Exception ex)
        {
            log.error("[定时任务-HTTP] 执行失败: jobName={}, url={}", sysJob.getJobName(), url, ex);
            throw new RuntimeException("HTTP请求失败: " + ex.getMessage(), ex);
        }
    }

    /**
     * 执行Bean调用
     *
     * @param sysJob 系统任务
     */
    private static void invokeBean(SysJob sysJob) throws Exception
    {
        String invokeTarget = sysJob.getInvokeTarget();
        String beanName = getBeanName(invokeTarget);
        String methodName = getMethodName(invokeTarget);
        List<Object[]> methodParams = getMethodParams(invokeTarget);

        log.info("[定时任务-Bean] 开始执行: jobName={}, bean={}, method={}", sysJob.getJobName(), beanName, methodName);

        if (!isValidClassName(beanName))
        {
            Object bean = SpringUtils.getBean(beanName);
            invokeMethod(bean, methodName, methodParams);
        }
        else
        {
            Object bean = Class.forName(beanName).getDeclaredConstructor().newInstance();
            invokeMethod(bean, methodName, methodParams);
        }
    }

    /**
     * 解析请求头JSON
     */
    private static HttpHeaders parseHeaders(String headersJson)
    {
        HttpHeaders headers = new HttpHeaders();
        if (headersJson == null || headersJson.isEmpty())
        {
            return headers;
        }
        try
        {
            JSONObject jsonObject = JSON.parseObject(headersJson);
            for (java.util.Map.Entry<String, Object> entry : jsonObject.entrySet())
            {
                headers.set(entry.getKey(), String.valueOf(entry.getValue()));
            }
        }
        catch (Exception ex)
        {
            log.warn("[定时任务] 解析请求头失败: {}", headersJson, ex);
        }
        return headers;
    }

    /**
     * 调用任务方法
     *
     * @param bean 目标对象
     * @param methodName 方法名称
     * @param methodParams 方法参数
     */
    private static void invokeMethod(Object bean, String methodName, List<Object[]> methodParams)
            throws NoSuchMethodException, SecurityException, IllegalAccessException, IllegalArgumentException,
            InvocationTargetException
    {
        if (StringUtils.isNotNull(methodParams) && methodParams.size() > 0)
        {
            Method method = bean.getClass().getMethod(methodName, getMethodParamsType(methodParams));
            method.invoke(bean, getMethodParamsValue(methodParams));
        }
        else
        {
            Method method = bean.getClass().getMethod(methodName);
            method.invoke(bean);
        }
    }

    /**
     * 校验是否为为class包名
     * 
     * @param invokeTarget 名称
     * @return true是 false否
     */
    public static boolean isValidClassName(String invokeTarget)
    {
        return StringUtils.countMatches(invokeTarget, ".") > 1;
    }

    /**
     * 获取bean名称
     * 
     * @param invokeTarget 目标字符串
     * @return bean名称
     */
    public static String getBeanName(String invokeTarget)
    {
        String beanName = StringUtils.substringBefore(invokeTarget, "(");
        return StringUtils.substringBeforeLast(beanName, ".");
    }

    /**
     * 获取bean方法
     * 
     * @param invokeTarget 目标字符串
     * @return method方法
     */
    public static String getMethodName(String invokeTarget)
    {
        String methodName = StringUtils.substringBefore(invokeTarget, "(");
        return StringUtils.substringAfterLast(methodName, ".");
    }

    /**
     * 获取method方法参数相关列表
     * 
     * @param invokeTarget 目标字符串
     * @return method方法相关参数列表
     */
    public static List<Object[]> getMethodParams(String invokeTarget)
    {
        String methodStr = StringUtils.substringBetweenLast(invokeTarget, "(", ")");
        if (StringUtils.isEmpty(methodStr))
        {
            return null;
        }
        String[] methodParams = methodStr.split(",(?=([^\"']*[\"'][^\"']*[\"'])*[^\"']*$)");
        List<Object[]> classs = new LinkedList<>();
        for (int i = 0; i < methodParams.length; i++)
        {
            String str = StringUtils.trimToEmpty(methodParams[i]);
            // String字符串类型，以'或"开头
            if (StringUtils.startsWithAny(str, "'", "\""))
            {
                classs.add(new Object[] { StringUtils.substring(str, 1, str.length() - 1), String.class });
            }
            // boolean布尔类型，等于true或者false
            else if ("true".equalsIgnoreCase(str) || "false".equalsIgnoreCase(str))
            {
                classs.add(new Object[] { Boolean.valueOf(str), Boolean.class });
            }
            // long长整形，以L结尾
            else if (StringUtils.endsWith(str, "L"))
            {
                classs.add(new Object[] { Long.valueOf(StringUtils.substring(str, 0, str.length() - 1)), Long.class });
            }
            // double浮点类型，以D结尾
            else if (StringUtils.endsWith(str, "D"))
            {
                classs.add(new Object[] { Double.valueOf(StringUtils.substring(str, 0, str.length() - 1)), Double.class });
            }
            // 其他类型归类为整形
            else
            {
                classs.add(new Object[] { Integer.valueOf(str), Integer.class });
            }
        }
        return classs;
    }

    /**
     * 获取参数类型
     * 
     * @param methodParams 参数相关列表
     * @return 参数类型列表
     */
    public static Class<?>[] getMethodParamsType(List<Object[]> methodParams)
    {
        Class<?>[] classs = new Class<?>[methodParams.size()];
        int index = 0;
        for (Object[] os : methodParams)
        {
            classs[index] = (Class<?>) os[1];
            index++;
        }
        return classs;
    }

    /**
     * 获取参数值
     * 
     * @param methodParams 参数相关列表
     * @return 参数值列表
     */
    public static Object[] getMethodParamsValue(List<Object[]> methodParams)
    {
        Object[] classs = new Object[methodParams.size()];
        int index = 0;
        for (Object[] os : methodParams)
        {
            classs[index] = (Object) os[0];
            index++;
        }
        return classs;
    }
}
