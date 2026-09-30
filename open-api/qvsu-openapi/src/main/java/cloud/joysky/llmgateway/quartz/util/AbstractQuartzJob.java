package cloud.joysky.llmgateway.quartz.util;

import java.util.Date;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import cloud.joysky.llmgateway.common.constant.Constants;
import cloud.joysky.llmgateway.common.constant.ScheduleConstants;
import cloud.joysky.llmgateway.common.utils.ExceptionUtil;
import cloud.joysky.llmgateway.common.utils.StringUtils;
import cloud.joysky.llmgateway.common.utils.bean.BeanUtils;
import cloud.joysky.llmgateway.common.utils.spring.SpringUtils;
import cloud.joysky.llmgateway.quartz.domain.SysJob;
import cloud.joysky.llmgateway.quartz.domain.SysJobLog;
import cloud.joysky.llmgateway.quartz.service.ISysJobLogService;

/**
 * 抽象quartz调用
 *
 * @author qvsu
 */
public abstract class AbstractQuartzJob implements Job
{
    private static final Logger log = LoggerFactory.getLogger(AbstractQuartzJob.class);

    /**
     * 线程本地变量
     */
    private static ThreadLocal<Date> threadLocal = new ThreadLocal<>();

    @Override
    public void execute(JobExecutionContext context)
    {
        SysJob sysJob = new SysJob();
        BeanUtils.copyBeanProp(sysJob, context.getMergedJobDataMap().get(ScheduleConstants.TASK_PROPERTIES));
        try
        {
            before(context, sysJob);
            if (sysJob != null)
            {
                log.info("[定时任务] 开始执行: jobName={}, jobType={}", sysJob.getJobName(), sysJob.getJobType());
                doExecute(context, sysJob);
                log.info("[定时任务] 执行成功: jobName={}", sysJob.getJobName());
            }
            after(context, sysJob, null);
        }
        catch (Exception e)
        {
            log.error("[定时任务] 执行异常: jobName={}", sysJob.getJobName(), e);
            after(context, sysJob, e);
        }
    }

    /**
     * 执行前
     *
     * @param context 工作执行上下文对象
     * @param sysJob 系统计划任务
     */
    protected void before(JobExecutionContext context, SysJob sysJob)
    {
        threadLocal.set(new Date());
    }

    /**
     * 执行后
     *
     * @param context 工作执行上下文对象
     * @param sysJob 系统计划任务
     */
    protected void after(JobExecutionContext context, SysJob sysJob, Exception e)
    {
        Date startTime = threadLocal.get();
        threadLocal.remove();

        final SysJobLog sysJobLog = new SysJobLog();
        sysJobLog.setJobName(sysJob.getJobName());
        sysJobLog.setJobGroup(sysJob.getJobGroup());
        
        // 对于HTTP任务，将请求方法和URL作为调用目标记录
        String invokeTarget = sysJob.getInvokeTarget();
        if (SysJob.JOB_TYPE_HTTP.equals(sysJob.getJobType()))
        {
            invokeTarget = sysJob.getRequestMethod() + " " + sysJob.getRequestUrl();
        }
        sysJobLog.setInvokeTarget(invokeTarget);
        sysJobLog.setStartTime(startTime);
        sysJobLog.setEndTime(new Date());
        long runMs = sysJobLog.getEndTime().getTime() - sysJobLog.getStartTime().getTime();
        sysJobLog.setJobMessage(sysJobLog.getJobName() + " 总共耗时：" + runMs + "毫秒");
        if (e != null)
        {
            sysJobLog.setStatus(Constants.FAIL);
            String errorMsg = StringUtils.substring(ExceptionUtil.getExceptionMessage(e), 0, 2000);
            sysJobLog.setExceptionInfo(errorMsg);
        }
        else
        {
            sysJobLog.setStatus(Constants.SUCCESS);
        }

        // 写入数据库当中
        try
        {
            SpringUtils.getBean(ISysJobLogService.class).addJobLog(sysJobLog);
            log.info("[定时任务] 日志已保存: jobName={}, status={}, cost={}ms", sysJobLog.getJobName(), sysJobLog.getStatus(), runMs);
        }
        catch (Exception ex)
        {
            log.error("[定时任务] 保存日志失败: jobName={}", sysJobLog.getJobName(), ex);
        }
    }

    /**
     * 执行方法，由子类重载
     *
     * @param context 工作执行上下文对象
     * @param sysJob 系统计划任务
     * @throws Exception 执行过程中的异常
     */
    protected abstract void doExecute(JobExecutionContext context, SysJob sysJob) throws Exception;
}
