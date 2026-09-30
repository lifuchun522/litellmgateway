package cloud.joysky.llmgateway.open.model;

import cloud.joysky.llmgateway.open.trace.TraceContext;

/**
 * OpenAPI 统一响应
 */
public class OpenResult<T>
{
    private Integer code;

    private String msg;

    private T data;

    private String traceId;

    public static <T> OpenResult<T> ok(T data)
    {
        OpenResult<T> result = new OpenResult<T>();
        result.setCode(0);
        result.setMsg("success");
        result.setData(data);
        result.setTraceId(TraceContext.get());
        return result;
    }

    public static OpenResult<?> fail(int code, String msg)
    {
        OpenResult<Object> result = new OpenResult<Object>();
        result.setCode(code);
        result.setMsg(msg);
        result.setData(null);
        result.setTraceId(TraceContext.get());
        return result;
    }

    public Integer getCode()
    {
        return code;
    }

    public void setCode(Integer code)
    {
        this.code = code;
    }

    public String getMsg()
    {
        return msg;
    }

    public void setMsg(String msg)
    {
        this.msg = msg;
    }

    public T getData()
    {
        return data;
    }

    public void setData(T data)
    {
        this.data = data;
    }

    public String getTraceId()
    {
        return traceId;
    }

    public void setTraceId(String traceId)
    {
        this.traceId = traceId;
    }
}
