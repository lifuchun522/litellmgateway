package cloud.joysky.llmgateway.open.domain;

import cloud.joysky.llmgateway.common.core.domain.OptBaseEntity;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class OpenApi extends OptBaseEntity
{
    private static final long serialVersionUID = 1L;

    /** API 名称 */
    private String apiName;

    /** 开放路径 */
    private String apiPath;

    /** HTTP 方法 */
    private String method;

    /** 后端真实服务地址 */
    private String targetUrl;

    /** 超时毫秒 */
    private Integer timeoutMs;

    /** 状态 (1=启用 0=禁用) */
    private Integer status;

    /** 1=需要签名 */
    private Integer needSign;

    /** 描述 */
    private String description;

    /** 请求示例 */
    private String reqExample;

    /** 响应示例 */
    private String respExample;

    public String getApiName()
    {
        return apiName;
    }

    public void setApiName(String apiName)
    {
        this.apiName = apiName;
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

    public String getTargetUrl()
    {
        return targetUrl;
    }

    public void setTargetUrl(String targetUrl)
    {
        this.targetUrl = targetUrl;
    }

    public Integer getTimeoutMs()
    {
        return timeoutMs;
    }

    public void setTimeoutMs(Integer timeoutMs)
    {
        this.timeoutMs = timeoutMs;
    }

    public Integer getStatus()
    {
        return status;
    }

    public void setStatus(Integer status)
    {
        this.status = status;
    }

    public Integer getNeedSign()
    {
        return needSign;
    }

    public void setNeedSign(Integer needSign)
    {
        this.needSign = needSign;
    }

    public String getDescription()
    {
        return description;
    }

    public void setDescription(String description)
    {
        this.description = description;
    }

    public String getReqExample()
    {
        return reqExample;
    }

    public void setReqExample(String reqExample)
    {
        this.reqExample = reqExample;
    }

    public String getRespExample()
    {
        return respExample;
    }

    public void setRespExample(String respExample)
    {
        this.respExample = respExample;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("sId", getsId())
            .append("apiName", getApiName())
            .append("apiPath", getApiPath())
            .append("method", getMethod())
            .append("targetUrl", getTargetUrl())
            .append("timeoutMs", getTimeoutMs())
            .append("status", getStatus())
            .append("needSign", getNeedSign())
            .append("description", getDescription())
            .append("sCreateBy", getsCreateBy())
            .append("sCreatedTime", getsCreatedTime())
            .append("sUpdateBy", getsUpdateBy())
            .append("sUpdatedTime", getsUpdatedTime())
            .toString();
    }
}
