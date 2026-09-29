package com.qvsu.open.domain;

import com.qvsu.common.core.domain.OptBaseEntity;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

public class OpenCallLog extends OptBaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 链路追踪 ID */
    private String traceId;

    /** 应用 Key */
    private String appKey;

    /** 应用名称 */
    private String appName;

    /** 请求路径 */
    private String apiPath;

    /** 请求方法 */
    private String method;

    /** 请求体 */
    private String reqBody;

    /** 响应码 */
    private Integer respCode;

    /** 响应体 */
    private String respBody;

    /** 耗时毫秒 */
    private Integer costMs;

    /** 调用状态 (0=成功 1=鉴权失败 2=转发失败) */
    private Integer status;

    /** 调用时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date callTime;

    /** 错误信息 */
    private String errorMsg;

    /** 客户端 IP */
    private String clientIp;

    public String getTraceId()
    {
        return traceId;
    }

    public void setTraceId(String traceId)
    {
        this.traceId = traceId;
    }

    public String getAppKey()
    {
        return appKey;
    }

    public void setAppKey(String appKey)
    {
        this.appKey = appKey;
    }

    public String getAppName()
    {
        return appName;
    }

    public void setAppName(String appName)
    {
        this.appName = appName;
    }

    public String getApiPath()
    {
        return apiPath;
    }

    public void setApiPath(String apiPath)
    {
        this.apiPath = apiPath;
    }

    public String getMethod()
    {
        return method;
    }

    public void setMethod(String method)
    {
        this.method = method;
    }

    public String getReqBody()
    {
        return reqBody;
    }

    public void setReqBody(String reqBody)
    {
        this.reqBody = reqBody;
    }

    public Integer getRespCode()
    {
        return respCode;
    }

    public void setRespCode(Integer respCode)
    {
        this.respCode = respCode;
    }

    public String getRespBody()
    {
        return respBody;
    }

    public void setRespBody(String respBody)
    {
        this.respBody = respBody;
    }

    public Integer getCostMs()
    {
        return costMs;
    }

    public void setCostMs(Integer costMs)
    {
        this.costMs = costMs;
    }

    public Integer getStatus()
    {
        return status;
    }

    public void setStatus(Integer status)
    {
        this.status = status;
    }

    public Date getCallTime()
    {
        return callTime;
    }

    public void setCallTime(Date callTime)
    {
        this.callTime = callTime;
    }

    public String getErrorMsg()
    {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg)
    {
        this.errorMsg = errorMsg;
    }

    public String getClientIp()
    {
        return clientIp;
    }

    public void setClientIp(String clientIp)
    {
        this.clientIp = clientIp;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("sId", getsId())
            .append("traceId", getTraceId())
            .append("appKey", getAppKey())
            .append("appName", getAppName())
            .append("apiPath", getApiPath())
            .append("method", getMethod())
            .append("respCode", getRespCode())
            .append("costMs", getCostMs())
            .append("status", getStatus())
            .append("callTime", getCallTime())
            .append("clientIp", getClientIp())
            .append("sCreateBy", getsCreateBy())
            .append("sCreatedTime", getsCreatedTime())
            .toString();
    }
}
