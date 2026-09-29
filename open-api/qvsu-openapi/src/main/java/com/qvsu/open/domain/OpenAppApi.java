package com.qvsu.open.domain;

import com.qvsu.common.core.domain.OptBaseEntity;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class OpenAppApi extends OptBaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 应用 ID */
    private Long appId;

    /** 接口 ID */
    private Long apiId;

    public Long getAppId()
    {
        return appId;
    }

    public void setAppId(Long appId)
    {
        this.appId = appId;
    }

    public Long getApiId()
    {
        return apiId;
    }

    public void setApiId(Long apiId)
    {
        this.apiId = apiId;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("sId", getsId())
            .append("appId", getAppId())
            .append("apiId", getApiId())
            .append("sCreateBy", getsCreateBy())
            .append("sCreatedTime", getsCreatedTime())
            .toString();
    }
}
