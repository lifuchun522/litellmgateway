package cloud.joysky.llmgateway.quartz.task;

import org.springframework.stereotype.Component;
import cloud.joysky.llmgateway.common.utils.StringUtils;

/**
 * 定时任务调度测试
 *
 * <p>第 02 境换骨：类名 {@code QvsuTask} → {@code LlmGatewayTask}，方法名去掉旧的 {@code qvsu} 前缀。</p>
 *
 * <p><b>兼容期一个月</b>：Bean 名保留旧的 {@code qvsuTask}。原因是 {@code sys_job.invoke_target}
 * 存的就是「Bean 名.方法名」字符串（实测 19 行全是 {@code qvsuTask.qvsuNoParams} 这类值），
 * 改 Bean 名会让所有已存在的定时任务在下一轮调度时抛「找不到目标」。
 * 兼容期内 Bean 名不动，数据库里改方法名（见 {@code open-api/sql/llmgateway_rename_upgrade.sql}），
 * 一个月后把本类的 @Component 值改为 {@code llmGatewayTask} 并删除该升级脚本的旧写法分支。</p>
 *
 * @author lifuchun
 */
@Component("qvsuTask")
public class LlmGatewayTask
{
    public void multipleParams(String s, Boolean b, Long l, Double d, Integer i)
    {
        System.out.println(StringUtils.format("执行多参方法： 字符串类型{}，布尔类型{}，长整型{}，浮点型{}，整形{}", s, b, l, d, i));
    }

    public void params(String params)
    {
        System.out.println("执行有参方法：" + params);
    }

    public void noParams()
    {
        System.out.println("执行无参方法");
    }
}
