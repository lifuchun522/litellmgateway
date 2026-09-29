package com.qvsu.open.domain;

import com.qvsu.common.core.domain.OptBaseEntity;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

public class OpenApp extends OptBaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 应用名称 */
    private String appName;

    /** 访问凭据 */
    private String appKey;

    /** 签名密钥 */
    private String appSecret;

    /** 对接联系人 */
    private String contact;

    /** 状态 (1=启用 0=禁用) */
    private Integer status;

    /** 凭据过期时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date expireTime;

    /** 备注 */
    private String remark;

    public String getAppName()
    {
        return appName;
    }

    public void setAppName(String appName)
    {
        this.appName = appName;
    }

    public String getAppKey()
    {
        return appKey;
    }

    public void setAppKey(String appKey)
    {
        this.appKey = appKey;
    }

    public String getAppSecret()
    {
        return appSecret;
    }

    public void setAppSecret(String appSecret)
    {
        this.appSecret = appSecret;
    }

    public String getContact()
    {
        return contact;
    }

    public void setContact(String contact)
    {
        this.contact = contact;
    }

    public Integer getStatus()
    {
        return status;
    }

    public void setStatus(Integer status)
    {
        this.status = status;
    }

    public Date getExpireTime()
    {
        return expireTime;
    }

    public void setExpireTime(Date expireTime)
    {
        this.expireTime = expireTime;
    }

    public String getRemark()
    {
        return remark;
    }

    public void setRemark(String remark)
    {
        this.remark = remark;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("sId", getsId())
            .append("appName", getAppName())
            .append("appKey", getAppKey())
            .append("contact", getContact())
            .append("status", getStatus())
            .append("expireTime", getExpireTime())
            .append("remark", getRemark())
            .append("sCreateBy", getsCreateBy())
            .append("sCreatedTime", getsCreatedTime())
            .append("sUpdateBy", getsUpdateBy())
            .append("sUpdatedTime", getsUpdatedTime())
            .toString();
    }
}
