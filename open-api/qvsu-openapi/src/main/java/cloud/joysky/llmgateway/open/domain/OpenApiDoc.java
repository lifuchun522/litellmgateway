package cloud.joysky.llmgateway.open.domain;

import cloud.joysky.llmgateway.common.core.domain.OptBaseEntity;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class OpenApiDoc extends OptBaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 应用 ID */
    private Long appId;

    /** 文档标题 */
    private String docTitle;

    /** 文档版本 */
    private String docVersion;

    /** 关联 API 列表 */
    private String apiIds;

    /** 文档 HTML 内容 */
    private String htmlContent;

    public Long getAppId()
    {
        return appId;
    }

    public void setAppId(Long appId)
    {
        this.appId = appId;
    }

    public String getDocTitle()
    {
        return docTitle;
    }

    public void setDocTitle(String docTitle)
    {
        this.docTitle = docTitle;
    }

    public String getDocVersion()
    {
        return docVersion;
    }

    public void setDocVersion(String docVersion)
    {
        this.docVersion = docVersion;
    }

    public String getApiIds()
    {
        return apiIds;
    }

    public void setApiIds(String apiIds)
    {
        this.apiIds = apiIds;
    }

    public String getHtmlContent()
    {
        return htmlContent;
    }

    public void setHtmlContent(String htmlContent)
    {
        this.htmlContent = htmlContent;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("sId", getsId())
            .append("appId", getAppId())
            .append("docTitle", getDocTitle())
            .append("docVersion", getDocVersion())
            .append("apiIds", getApiIds())
            .append("sCreateBy", getsCreateBy())
            .append("sCreatedTime", getsCreatedTime())
            .toString();
    }
}
