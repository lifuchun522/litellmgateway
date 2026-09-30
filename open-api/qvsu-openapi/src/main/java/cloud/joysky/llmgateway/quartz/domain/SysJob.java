package cloud.joysky.llmgateway.quartz.domain;

import java.io.Serializable;
import java.util.Date;
import javax.validation.constraints.*;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import cloud.joysky.llmgateway.common.annotation.Excel;
import cloud.joysky.llmgateway.common.annotation.Excel.ColumnType;
import cloud.joysky.llmgateway.common.constant.ScheduleConstants;
import cloud.joysky.llmgateway.common.core.domain.BaseEntity;
import cloud.joysky.llmgateway.common.utils.StringUtils;
import cloud.joysky.llmgateway.quartz.util.CronUtils;

/**
 * 定时任务调度表 sys_job
 * 
 * @author qvsu
 */
public class SysJob extends BaseEntity implements Serializable
{
    private static final long serialVersionUID = 1L;

    /** 调度类型: Bean调用 */
    public static final String JOB_TYPE_BEAN = "1";

    /** 调度类型: HTTP调用 */
    public static final String JOB_TYPE_HTTP = "2";

    /** 任务ID */
    @Excel(name = "任务序号", cellType = ColumnType.NUMERIC)
    private Long jobId;

    /** 任务名称 */
    @Excel(name = "任务名称")
    private String jobName;

    /** 任务组名 */
    @Excel(name = "任务组名")
    private String jobGroup;

    /** 调度类型（1=Bean调用 2=HTTP调用） */
    @Excel(name = "调度类型", readConverterExp = "1=Bean调用,2=HTTP调用")
    private String jobType = JOB_TYPE_BEAN;

    /** 调用目标字符串 */
    @Excel(name = "调用目标字符串")
    private String invokeTarget;

    /** HTTP请求URL（jobType=2时使用） */
    @Excel(name = "请求URL")
    private String requestUrl;

    /** HTTP请求方法（jobType=2时使用） */
    @Excel(name = "请求方法")
    private String requestMethod = "GET";

    /** HTTP请求头（jobType=2时使用） */
    @Excel(name = "请求头")
    private String requestHeaders;

    /** HTTP请求体（jobType=2时使用） */
    @Excel(name = "请求体")
    private String requestBody;

    /** HTTP Content-Type（jobType=2时使用） */
    @Excel(name = "Content-Type")
    private String contentType = "application/json";

    /** HTTP超时时间（毫秒，jobType=2时使用） */
    @Excel(name = "超时时间")
    private Integer timeout = 5000;

    /** cron执行表达式 */
    @Excel(name = "执行表达式 ")
    private String cronExpression;

    /** cron计划策略 */
    @Excel(name = "计划策略 ", readConverterExp = "0=默认,1=立即触发执行,2=触发一次执行,3=不触发立即执行")
    private String misfirePolicy = ScheduleConstants.MISFIRE_DEFAULT;

    /** 是否并发执行（0允许 1禁止） */
    @Excel(name = "并发执行", readConverterExp = "0=允许,1=禁止")
    private String concurrent;

    /** 任务状态（0正常 1暂停） */
    @Excel(name = "任务状态", readConverterExp = "0=正常,1=暂停")
    private String status;

    public Long getJobId()
    {
        return jobId;
    }

    public void setJobId(Long jobId)
    {
        this.jobId = jobId;
    }

    @NotBlank(message = "任务名称不能为空")
    @Size(min = 0, max = 64, message = "任务名称不能超过64个字符")
    public String getJobName()
    {
        return jobName;
    }

    public void setJobName(String jobName)
    {
        this.jobName = jobName;
    }

    public String getJobGroup()
    {
        return jobGroup;
    }

    public void setJobGroup(String jobGroup)
    {
        this.jobGroup = jobGroup;
    }

    public String getJobType()
    {
        return jobType;
    }

    public void setJobType(String jobType)
    {
        this.jobType = jobType;
    }

    @Size(min = 0, max = 1000, message = "调用目标字符串长度不能超过1000个字符")
    public String getInvokeTarget()
    {
        return invokeTarget;
    }

    public void setInvokeTarget(String invokeTarget)
    {
        this.invokeTarget = invokeTarget;
    }

    public String getRequestUrl()
    {
        return requestUrl;
    }

    public void setRequestUrl(String requestUrl)
    {
        this.requestUrl = requestUrl;
    }

    public String getRequestMethod()
    {
        return requestMethod;
    }

    public void setRequestMethod(String requestMethod)
    {
        this.requestMethod = requestMethod;
    }

    public String getRequestHeaders()
    {
        return requestHeaders;
    }

    public void setRequestHeaders(String requestHeaders)
    {
        this.requestHeaders = requestHeaders;
    }

    public String getRequestBody()
    {
        return requestBody;
    }

    public void setRequestBody(String requestBody)
    {
        this.requestBody = requestBody;
    }

    public String getContentType()
    {
        return contentType;
    }

    public void setContentType(String contentType)
    {
        this.contentType = contentType;
    }

    public Integer getTimeout()
    {
        return timeout;
    }

    public void setTimeout(Integer timeout)
    {
        this.timeout = timeout;
    }

    @NotBlank(message = "Cron执行表达式不能为空")
    @Size(min = 0, max = 255, message = "Cron执行表达式不能超过255个字符")
    public String getCronExpression()
    {
        return cronExpression;
    }

    public void setCronExpression(String cronExpression)
    {
        this.cronExpression = cronExpression;
    }

    public Date getNextValidTime()
    {
        if (StringUtils.isNotEmpty(cronExpression))
        {
            return CronUtils.getNextExecution(cronExpression);
        }
        return null;
    }

    public String getMisfirePolicy()
    {
        return misfirePolicy;
    }

    public void setMisfirePolicy(String misfirePolicy)
    {
        this.misfirePolicy = misfirePolicy;
    }

    public String getConcurrent()
    {
        return concurrent;
    }

    public void setConcurrent(String concurrent)
    {
        this.concurrent = concurrent;
    }

    public String getStatus()
    {
        return status;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("jobId", getJobId())
            .append("jobName", getJobName())
            .append("jobGroup", getJobGroup())
            .append("jobType", getJobType())
            .append("invokeTarget", getInvokeTarget())
            .append("requestUrl", getRequestUrl())
            .append("requestMethod", getRequestMethod())
            .append("cronExpression", getCronExpression())
            .append("nextValidTime", getNextValidTime())
            .append("misfirePolicy", getMisfirePolicy())
            .append("concurrent", getConcurrent())
            .append("status", getStatus())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
