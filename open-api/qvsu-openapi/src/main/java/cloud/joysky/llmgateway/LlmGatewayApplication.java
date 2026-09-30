package cloud.joysky.llmgateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

/**
 * 启动程序
 * 
 * @author qvsu
 */
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class LlmGatewayApplication
{
    public static void main(String[] args)
    {
        // System.setProperty("spring.devtools.restart.enabled", "false");
        SpringApplication.run(LlmGatewayApplication.class, args);
        System.out.println("(♥◠‿◠)ﾉﾞ  qvsu openapi 启动成功   ლ(´ڡ`ლ)ﾞ ");
    }
}

