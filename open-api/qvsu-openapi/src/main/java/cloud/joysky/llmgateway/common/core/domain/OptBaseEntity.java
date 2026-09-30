package cloud.joysky.llmgateway.common.core.domain;

import java.io.Serializable;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * OpenAPI Entity基类
 * 
 * @author qvsu
 */
public class OptBaseEntity implements Serializable
{
    private static final long serialVersionUID = 1L;

    /** 唯一标识 */
    private Long sId;

    /** 创建人 */
    private String sCreateBy;

    /** 创建部门 */
    private String sCreatedDept;

    /** 可操作本条数据的人员 */
    private String sOwner;

    /** 可见本条数据的人员所在部门 */
    private String sOwnerDept;

    /** 可见本条数据 */
    private String sFacilitator;

    /** 创建时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date sCreatedTime;

    /** 本条数据的状态:0：无效;1:有效 */
    private Integer sStatus;

    /** 删除标识:0：无效;1:有效 */
    private Integer sIsDel;

    /** 从属组织 */
    private String sOrgCode;

    /** 修改时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date sUpdatedTime;

    /** 修改人 */
    private String sUpdateBy;

    /** 搜索值 */
    @JsonIgnore
    private String searchValue;

    /** 请求参数 */
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private Map<String, Object> params;

    public Long getsId()
    {
        return sId;
    }

    public void setsId(Long sId)
    {
        this.sId = sId;
    }

    /**
     * 兼容前端 id 字段名
     */
    public Long getId()
    {
        return sId;
    }

    public void setId(Long id)
    {
        this.sId = id;
    }

    public String getsCreateBy()
    {
        return sCreateBy;
    }

    public void setsCreateBy(String sCreateBy)
    {
        this.sCreateBy = sCreateBy;
    }

    public String getsCreatedDept()
    {
        return sCreatedDept;
    }

    public void setsCreatedDept(String sCreatedDept)
    {
        this.sCreatedDept = sCreatedDept;
    }

    public String getsOwner()
    {
        return sOwner;
    }

    public void setsOwner(String sOwner)
    {
        this.sOwner = sOwner;
    }

    public String getsOwnerDept()
    {
        return sOwnerDept;
    }

    public void setsOwnerDept(String sOwnerDept)
    {
        this.sOwnerDept = sOwnerDept;
    }

    public String getsFacilitator()
    {
        return sFacilitator;
    }

    public void setsFacilitator(String sFacilitator)
    {
        this.sFacilitator = sFacilitator;
    }

    public Date getsCreatedTime()
    {
        return sCreatedTime;
    }

    public void setsCreatedTime(Date sCreatedTime)
    {
        this.sCreatedTime = sCreatedTime;
    }

    /**
     * 兼容前端 createTime 字段名
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    public Date getCreateTime()
    {
        return sCreatedTime;
    }

    public void setCreateTime(Date createTime)
    {
        this.sCreatedTime = createTime;
    }

    /**
     * 兼容前端 createBy 字段名
     */
    public String getCreateBy()
    {
        return sCreateBy;
    }

    public void setCreateBy(String createBy)
    {
        this.sCreateBy = createBy;
    }

    /**
     * 兼容前端 updateTime 字段名
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    public Date getUpdateTime()
    {
        return sUpdatedTime;
    }

    public void setUpdateTime(Date updateTime)
    {
        this.sUpdatedTime = updateTime;
    }

    /**
     * 兼容前端 updateBy 字段名
     */
    public String getUpdateBy()
    {
        return sUpdateBy;
    }

    public void setUpdateBy(String updateBy)
    {
        this.sUpdateBy = updateBy;
    }

    public Integer getsStatus()
    {
        return sStatus;
    }

    public void setsStatus(Integer sStatus)
    {
        this.sStatus = sStatus;
    }

    public Integer getsIsDel()
    {
        return sIsDel;
    }

    public void setsIsDel(Integer sIsDel)
    {
        this.sIsDel = sIsDel;
    }

    public String getsOrgCode()
    {
        return sOrgCode;
    }

    public void setsOrgCode(String sOrgCode)
    {
        this.sOrgCode = sOrgCode;
    }

    public Date getsUpdatedTime()
    {
        return sUpdatedTime;
    }

    public void setsUpdatedTime(Date sUpdatedTime)
    {
        this.sUpdatedTime = sUpdatedTime;
    }

    public String getsUpdateBy()
    {
        return sUpdateBy;
    }

    public void setsUpdateBy(String sUpdateBy)
    {
        this.sUpdateBy = sUpdateBy;
    }

    public String getSearchValue()
    {
        return searchValue;
    }

    public void setSearchValue(String searchValue)
    {
        this.searchValue = searchValue;
    }

    public Map<String, Object> getParams()
    {
        if (params == null)
        {
            params = new HashMap<>();
        }
        return params;
    }

    public void setParams(Map<String, Object> params)
    {
        this.params = params;
    }
}
